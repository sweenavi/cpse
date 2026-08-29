"""
Migration Service — Main Orchestrator.
Coordinates the full Legacy Migration pipeline:
Upload → Preprocess → OCR → Table Detection → Extract → Normalize → Validate → Score → Export
"""

import os
import io
import time
import uuid
import logging
import shutil
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

import pandas as pd

from .models import LegacyMaterialRecord, MigrationJob, AuditLogEntry
from .industrial_dictionary import apply_ocr_corrections, extract_engineering_attributes, normalize_uom
from .field_extractor import extract_records_from_table

logger = logging.getLogger(__name__)

# ──────────── In-Memory Storage (consistent with existing project) ────────────
MIGRATION_STATE: Dict[str, Any] = {
    "jobs": {},        # migration_id -> MigrationJob
    "records": {},     # migration_id -> List[LegacyMaterialRecord]
    "audit_log": [],   # List[AuditLogEntry]
    "uploaded_files": {},  # migration_id -> {"original": path, "processed": path}
}

# Base directory for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")


def _ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def create_migration(
    file_bytes: bytes,
    filename: str,
    uploaded_by: str = "system",
) -> MigrationJob:
    """Create a new migration job from an uploaded file."""
    _ensure_upload_dir()

    job = MigrationJob(
        source_filename=filename,
        uploaded_by=uploaded_by,
    )

    # Determine file type
    ext = os.path.splitext(filename)[1].lower()
    if ext in ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp']:
        job.source_type = "IMAGE"
    elif ext == '.pdf':
        job.source_type = "PDF"
    elif ext == '.csv':
        job.source_type = "CSV"
    elif ext in ['.xls', '.xlsx']:
        job.source_type = "EXCEL"
    else:
        job.source_type = "UNKNOWN"
        job.processing_status = "FAILED"
        job.errors.append(f"Unsupported file type: {ext}")

    # Save the uploaded file
    job_dir = os.path.join(UPLOAD_DIR, job.migration_id)
    os.makedirs(job_dir, exist_ok=True)

    original_path = os.path.join(job_dir, filename)
    with open(original_path, 'wb') as f:
        f.write(file_bytes)

    MIGRATION_STATE["uploaded_files"][job.migration_id] = {
        "original": original_path,
        "processed": None,
        "job_dir": job_dir,
    }

    # Mark upload step complete
    job.pipeline_steps[0]["status"] = "complete"
    job.processing_progress = 10
    job.current_step = "Upload Complete"

    MIGRATION_STATE["jobs"][job.migration_id] = job
    MIGRATION_STATE["records"][job.migration_id] = []

    # Log audit
    _log_audit("UPLOAD", job.migration_id, "", uploaded_by, "", "", filename)

    return job


def process_migration(migration_id: str) -> MigrationJob:
    """Run the full processing pipeline for a migration job."""
    job = MIGRATION_STATE["jobs"].get(migration_id)
    if not job:
        raise ValueError(f"Migration job {migration_id} not found")

    file_info = MIGRATION_STATE["uploaded_files"].get(migration_id)
    if not file_info:
        raise ValueError(f"No uploaded file for {migration_id}")

    start_time = time.time()
    job.processing_status = "PROCESSING"

    try:
        if job.source_type == "IMAGE":
            _process_image(job, file_info)
        elif job.source_type == "CSV":
            _process_csv(job, file_info)
        elif job.source_type == "EXCEL":
            _process_excel(job, file_info)
        elif job.source_type == "PDF":
            _process_pdf(job, file_info)
        else:
            job.processing_status = "FAILED"
            job.errors.append(f"Unsupported source type: {job.source_type}")

    except Exception as e:
        logger.error(f"Processing failed for {migration_id}: {e}")
        job.processing_status = "FAILED"
        job.errors.append(str(e))
        job.error_count += 1

    job.processing_duration = round(time.time() - start_time, 2)

    # Update aggregate stats
    records = MIGRATION_STATE["records"].get(migration_id, [])
    job.records_detected = len(records)
    job.records_extracted = len(records)
    job.records_pending_review = sum(1 for r in records if r.review_required)
    job.records_approved = sum(1 for r in records if r.reviewer_action == "AUTO_APPROVED")
    job.average_ocr_confidence = round(
        sum(r.overall_confidence for r in records) / len(records), 1
    ) if records else 0.0

    if job.processing_status != "FAILED":
        if job.records_pending_review > 0:
            job.processing_status = "REVIEW_REQUIRED"
        else:
            job.processing_status = "APPROVED"

    MIGRATION_STATE["jobs"][migration_id] = job
    return job


def _process_image(job: MigrationJob, file_info: Dict):
    """Process an image file through the full OCR pipeline."""
    original_path = file_info["original"]
    job_dir = file_info["job_dir"]

    # Step 1: Preprocess
    job.pipeline_steps[1]["status"] = "active"
    job.current_step = "Preprocessing Image"
    job.processing_progress = 20

    try:
        from .image_preprocessor import preprocess_image, detect_document_type
        import cv2

        _, processed_path = preprocess_image(original_path, os.path.join(job_dir, "processed"))
        file_info["processed"] = processed_path

        # Detect document type
        gray = cv2.imread(processed_path, cv2.IMREAD_GRAYSCALE)
        if gray is not None:
            job.document_type = detect_document_type(gray)
        else:
            job.document_type = "PRINTED"
    except Exception as e:
        logger.warning(f"Preprocessing failed, using original: {e}")
        processed_path = original_path
        job.document_type = "PRINTED"

    job.pipeline_steps[1]["status"] = "complete"
    job.processing_progress = 30

    # Step 2: OCR
    job.pipeline_steps[2]["status"] = "active"
    job.current_step = "Running OCR Engine"
    job.processing_progress = 40

    try:
        from .ocr_provider import get_ocr_provider
        ocr = get_ocr_provider()
        ocr_result = ocr.extract(processed_path)
        job.document_type = ocr_result.document_type
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        job.errors.append(f"OCR failed: {e}")
        job.error_count += 1
        job.pipeline_steps[2]["status"] = "error"
        raise

    job.pipeline_steps[2]["status"] = "complete"
    job.processing_progress = 55

    # Step 3: Table Detection
    job.pipeline_steps[3]["status"] = "active"
    job.current_step = "Detecting Table Structure"
    job.processing_progress = 60

    try:
        from .table_detector import detect_table
        table = detect_table(processed_path, ocr_result.words)
    except Exception as e:
        logger.warning(f"Table detection failed: {e}")
        table = None

    job.pipeline_steps[3]["status"] = "complete"
    job.processing_progress = 70

    # Step 4-6: Attribute Extraction + Normalization + Validation
    job.pipeline_steps[4]["status"] = "active"
    job.current_step = "Extracting Attributes"
    job.processing_progress = 75

    records = []
    if table and table.header_row and table.data_rows:
        records = extract_records_from_table(
            header_row=table.header_row,
            data_rows=table.data_rows,
            source_file=job.source_filename,
            ocr_confidence=ocr_result.average_confidence,
        )
    else:
        # Fallback: parse OCR text line by line
        records = _fallback_line_parse(ocr_result, job.source_filename)

    job.pipeline_steps[4]["status"] = "complete"
    job.pipeline_steps[5]["status"] = "complete"  # Normalization done inside extractor
    job.processing_progress = 85

    # Step 7: Validation
    job.pipeline_steps[6]["status"] = "active"
    job.current_step = "Validating Records"

    for rec in records:
        _validate_record(rec)

    job.pipeline_steps[6]["status"] = "complete"
    job.processing_progress = 90

    # Step 8: Confidence Scoring (already done in extractor, finalize)
    job.pipeline_steps[7]["status"] = "complete"
    job.processing_progress = 95

    # Step 9: Ready for Review
    job.pipeline_steps[8]["status"] = "complete"
    job.processing_progress = 100
    job.current_step = "Complete"

    MIGRATION_STATE["records"][job.migration_id] = records


def _process_csv(job: MigrationJob, file_info: Dict):
    """Process a CSV file (no OCR needed)."""
    job.document_type = "SPREADSHEET"

    # Skip OCR steps
    job.pipeline_steps[1]["status"] = "skipped"  # No preprocessing
    job.pipeline_steps[2]["status"] = "skipped"  # No OCR
    job.pipeline_steps[3]["status"] = "skipped"  # No table detection

    job.pipeline_steps[4]["status"] = "active"
    job.current_step = "Parsing CSV"
    job.processing_progress = 50

    from .spreadsheet_loader import load_csv
    records, meta = load_csv(file_info["original"], job.source_filename)

    job.pipeline_steps[4]["status"] = "complete"
    job.pipeline_steps[5]["status"] = "complete"
    job.pipeline_steps[6]["status"] = "complete"
    job.pipeline_steps[7]["status"] = "complete"
    job.pipeline_steps[8]["status"] = "complete"
    job.processing_progress = 100
    job.current_step = "Complete"

    if meta.get("error"):
        job.errors.append(meta["error"])
        job.error_count += 1

    MIGRATION_STATE["records"][job.migration_id] = records


def _process_excel(job: MigrationJob, file_info: Dict):
    """Process an Excel file (no OCR needed)."""
    job.document_type = "SPREADSHEET"

    job.pipeline_steps[1]["status"] = "skipped"
    job.pipeline_steps[2]["status"] = "skipped"
    job.pipeline_steps[3]["status"] = "skipped"

    job.pipeline_steps[4]["status"] = "active"
    job.current_step = "Parsing Excel"
    job.processing_progress = 50

    from .spreadsheet_loader import load_excel
    records, meta = load_excel(file_info["original"], job.source_filename)

    job.pipeline_steps[4]["status"] = "complete"
    job.pipeline_steps[5]["status"] = "complete"
    job.pipeline_steps[6]["status"] = "complete"
    job.pipeline_steps[7]["status"] = "complete"
    job.pipeline_steps[8]["status"] = "complete"
    job.processing_progress = 100
    job.current_step = "Complete"

    if meta.get("error"):
        job.errors.append(meta["error"])

    MIGRATION_STATE["records"][job.migration_id] = records


def _process_pdf(job: MigrationJob, file_info: Dict):
    """Process a PDF — extract text or render pages as images for OCR."""
    job.document_type = "PRINTED"

    # For now, treat PDF pages as images
    # Future: detect embedded text vs scanned
    try:
        from PIL import Image
        import fitz  # PyMuPDF
    except ImportError:
        # Simple fallback: treat as image if possible
        job.errors.append("PDF processing requires PyMuPDF (pip install pymupdf). Treating as image.")
        _process_image(job, file_info)
        return

    job.pipeline_steps[1]["status"] = "active"
    job.current_step = "Extracting PDF Pages"
    job.processing_progress = 20

    doc = fitz.open(file_info["original"])
    job.page_count = len(doc)

    all_records = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=200)
        img_path = os.path.join(file_info["job_dir"], f"page_{page_num + 1}.png")
        pix.save(img_path)

        # Process each page as an image
        page_file_info = {
            "original": img_path,
            "processed": None,
            "job_dir": file_info["job_dir"],
        }
        page_job = MigrationJob(source_filename=f"page_{page_num + 1}.png")
        _process_image(page_job, page_file_info)

        page_records = MIGRATION_STATE["records"].get(page_job.migration_id, [])
        for r in page_records:
            r.source_page = page_num + 1
        all_records.extend(page_records)

    doc.close()

    MIGRATION_STATE["records"][job.migration_id] = all_records
    job.pipeline_steps[1]["status"] = "complete"
    job.processing_progress = 100
    job.current_step = "Complete"


def _fallback_line_parse(ocr_result, source_file: str) -> List[LegacyMaterialRecord]:
    """
    Fallback: parse OCR text line by line, detecting tab/delimiter columns
    or extracting structured engineering attributes.
    """
    import re
    lines = ocr_result.full_text.split('\n') if ocr_result.full_text else []
    lines = [l.strip() for l in lines if l.strip() and len(l.strip()) > 3]

    records = []
    for idx, line in enumerate(lines):
        # Skip header rows
        if any(h in line.lower() for h in ['item code', 'material code', 'sl no', 'sr no', 'uom', 'part no']):
            if idx == 0 or idx == 1:
                continue

        code = ""
        desc = line
        uom = "NOS"
        qty = None
        rate = None

        if '	' in line:
            parts = [p.strip() for p in line.split('	') if p.strip()]
            if len(parts) >= 2:
                code = parts[0]
                desc = parts[1]
                if len(parts) >= 3:
                    uom = normalize_uom(parts[2])
                if len(parts) >= 4:
                    try: qty = float(re.sub(r'[^0-9.]', '', parts[3]))
                    except: pass
                if len(parts) >= 5:
                    try: rate = float(re.sub(r'[^0-9.]', '', parts[4]))
                    except: pass

        corrected, corrections = apply_ocr_corrections(desc)
        eng_attrs = extract_engineering_attributes(corrected)

        rec = LegacyMaterialRecord(
            legacy_material_code=code or f"LEG-{idx+1:04d}",
            material_description=corrected,
            uom=uom or "NOS",
            quantity=qty,
            unit_price=rate,
            total_value=round(qty * rate, 2) if (qty is not None and rate is not None) else None,
            source_file=source_file,
            source_row=idx + 1,
            original_ocr_text=line,
            corrected_text=corrected,
            ocr_corrections=corrections,
            ocr_confidence=round(ocr_result.average_confidence * 100, 1),
            material_grade=eng_attrs.get("material_grade", ""),
            dimensions=eng_attrs.get("dimensions", ""),
            pressure_class=eng_attrs.get("pressure_class", ""),
            schedule=eng_attrs.get("schedule", ""),
            standard=eng_attrs.get("standard", ""),
            material_group=eng_attrs.get("material_group", ""),
        )

        rec.extraction_confidence = 88.0 if code and uom else 70.0
        rec.overall_confidence = round(
            (rec.ocr_confidence * 0.5 + rec.extraction_confidence * 0.5), 1
        )
        if rec.overall_confidence >= 95:
            rec.validation_status = "GREEN"
            rec.review_required = False
            rec.reviewer_action = "AUTO_APPROVED"
        elif rec.overall_confidence >= 70:
            rec.validation_status = "YELLOW"
            rec.review_required = True
            rec.reviewer_action = "PENDING"
        else:
            rec.validation_status = "RED"
            rec.review_required = True
            rec.reviewer_action = "PENDING"

        records.append(rec)

    return records


# ──────────── Public API Functions ────────────

def _validate_record(record: LegacyMaterialRecord):
    """Run validation checks on a record."""
    if record.quantity is not None and record.quantity < 0:
        record.review_required = True
        record.validation_status = "RED"

    if record.unit_price is not None and record.unit_price < 0:
        record.review_required = True
        record.validation_status = "RED"

    if record.quantity and record.unit_price and record.total_value:
        expected_total = record.quantity * record.unit_price
        if abs(expected_total - record.total_value) / max(expected_total, 1) > 0.1:
            record.review_required = True
            if record.validation_status == "GREEN":
                record.validation_status = "YELLOW"


def get_migration_status(migration_id: str) -> Optional[MigrationJob]:
    return MIGRATION_STATE["jobs"].get(migration_id)


def get_migration_records(migration_id: str) -> List[LegacyMaterialRecord]:
    return MIGRATION_STATE["records"].get(migration_id, [])


def get_migration_preview(migration_id: str) -> Dict[str, Any]:
    job = MIGRATION_STATE["jobs"].get(migration_id)
    records = MIGRATION_STATE["records"].get(migration_id, [])
    if not job:
        return {}

    green = [r for r in records if r.validation_status == "GREEN"]
    yellow = [r for r in records if r.validation_status == "YELLOW"]
    red = [r for r in records if r.validation_status == "RED"]

    return {
        "migration_id": job.migration_id,
        "source_filename": job.source_filename,
        "source_type": job.source_type,
        "document_type": job.document_type,
        "total_records": len(records),
        "green_count": len(green),
        "yellow_count": len(yellow),
        "red_count": len(red),
        "average_confidence": job.average_ocr_confidence,
        "processing_status": job.processing_status,
        "records": [r.model_dump() for r in records],
    }


def update_record(migration_id: str, record_id: str, updates: Dict[str, Any], user: str = "reviewer") -> Optional[LegacyMaterialRecord]:
    records = MIGRATION_STATE["records"].get(migration_id, [])
    for rec in records:
        if rec.record_id == record_id:
            before_values = {}
            for field, value in updates.items():
                if hasattr(rec, field):
                    before_values[field] = getattr(rec, field)
                    setattr(rec, field, value)
                    _log_audit("CORRECTION", migration_id, record_id, user, field,
                               str(before_values[field]), str(value))

            rec.reviewer_action = "CORRECTED"
            return rec
    return None


def approve_records(migration_id: str, record_ids: List[str], user: str = "reviewer") -> Dict[str, Any]:
    records = MIGRATION_STATE["records"].get(migration_id, [])
    approved = 0
    for rec in records:
        if rec.record_id in record_ids or not record_ids:
            if rec.validation_status in ["GREEN", "YELLOW"]:
                rec.reviewer_action = "APPROVED"
                rec.review_required = False
                approved += 1
                _log_audit("APPROVAL", migration_id, rec.record_id, user, "", "", "")

    # Update job stats
    job = MIGRATION_STATE["jobs"].get(migration_id)
    if job:
        job.records_approved = sum(1 for r in records if r.reviewer_action in ["APPROVED", "AUTO_APPROVED"])
        job.records_pending_review = sum(1 for r in records if r.reviewer_action == "PENDING")
        if job.records_pending_review == 0:
            job.processing_status = "APPROVED"

    return {"approved": approved}


def reject_record(migration_id: str, record_id: str, user: str = "reviewer") -> bool:
    records = MIGRATION_STATE["records"].get(migration_id, [])
    for rec in records:
        if rec.record_id == record_id:
            rec.reviewer_action = "REJECTED"
            rec.review_required = False
            _log_audit("REJECTION", migration_id, record_id, user, "", "", "")

            # Update job stats
            job = MIGRATION_STATE["jobs"].get(migration_id)
            if job:
                job.records_rejected += 1
                job.records_pending_review = sum(1 for r in records if r.reviewer_action == "PENDING")
            return True
    return False


def import_approved_records(migration_id: str) -> Dict[str, Any]:
    """Import approved records into the main material harmonization system."""
    records = MIGRATION_STATE["records"].get(migration_id, [])
    approved = [r for r in records if r.reviewer_action in ["APPROVED", "AUTO_APPROVED"]]

    job = MIGRATION_STATE["jobs"].get(migration_id)
    if job:
        job.processing_status = "IMPORTED"

    _log_audit("IMPORT", migration_id, "", "system", "", "", f"Imported {len(approved)} records")

    return {
        "imported_count": len(approved),
        "records": [r.model_dump() for r in approved],
    }


def export_records_excel(migration_id: str) -> Optional[bytes]:
    """Export migration records as an Excel file."""
    records = MIGRATION_STATE["records"].get(migration_id, [])
    if not records:
        return None

    rows = _records_to_export_rows(records)
    df = pd.DataFrame(rows)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Legacy Migration')
    return output.getvalue()


def export_records_csv(migration_id: str) -> Optional[str]:
    """Export migration records as CSV string."""
    records = MIGRATION_STATE["records"].get(migration_id, [])
    if not records:
        return None

    rows = _records_to_export_rows(records)
    df = pd.DataFrame(rows)
    return df.to_csv(index=False)


def _records_to_export_rows(records: List[LegacyMaterialRecord]) -> List[Dict]:
    rows = []
    for r in records:
        rows.append({
            "Source": r.source_file,
            "Legacy Code": r.legacy_material_code,
            "Description": r.material_description,
            "Group": r.material_group,
            "UoM": r.uom,
            "Brand": r.make_brand,
            "Material Grade": r.material_grade,
            "Dimension": r.dimensions,
            "Pressure Class": r.pressure_class,
            "Schedule": r.schedule,
            "Standard": r.standard,
            "HSN/SAC": r.hsn_sac_code,
            "Qty": r.quantity,
            "Unit Price": r.unit_price,
            "Total Value": r.total_value,
            "OCR Confidence": f"{r.ocr_confidence}%",
            "Extraction Confidence": f"{r.extraction_confidence}%",
            "Overall Confidence": f"{r.overall_confidence}%",
            "Status": r.validation_status,
            "Review": r.reviewer_action,
        })
    return rows


def get_all_jobs() -> List[MigrationJob]:
    return list(MIGRATION_STATE["jobs"].values())


def get_uploaded_image_path(migration_id: str) -> Optional[str]:
    """Get path to the original uploaded image for display."""
    file_info = MIGRATION_STATE["uploaded_files"].get(migration_id)
    if file_info:
        return file_info.get("original")
    return None


def _log_audit(action, migration_id, record_id, user, field, before, after):
    MIGRATION_STATE["audit_log"].append(AuditLogEntry(
        action=action,
        migration_id=migration_id,
        record_id=record_id,
        user=user,
        field=field,
        before_value=before,
        after_value=after,
    ).model_dump())
