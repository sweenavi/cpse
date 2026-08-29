"""
Field Extractor & Confidence Scoring Engine.
Maps extracted table cells into LegacyMaterialRecord schema.
Applies engineering attribute extraction and tri-tier confidence scoring.
"""

import re
import logging
from typing import List, Dict, Any, Optional

from .models import LegacyMaterialRecord
from .industrial_dictionary import (
    normalize_column_name, normalize_uom, classify_material_group,
    apply_ocr_corrections, extract_engineering_attributes,
    COLUMN_NAME_MAP,
)

logger = logging.getLogger(__name__)


def extract_records_from_table(
    header_row: List[str],
    data_rows: List[List[str]],
    source_file: str,
    source_page: int = 1,
    ocr_confidence: float = 0.9,
) -> List[LegacyMaterialRecord]:
    """
    Convert table rows into structured LegacyMaterialRecord objects.
    """
    # Normalize header names to schema fields
    field_mapping = _map_headers_to_schema(header_row)

    records = []
    for row_idx, row in enumerate(data_rows):
        try:
            record = _extract_single_record(
                row, field_mapping, header_row,
                source_file=source_file,
                source_page=source_page,
                source_row=row_idx + 1,
                base_ocr_confidence=ocr_confidence,
            )
            if record and (record.legacy_material_code or record.material_description):
                records.append(record)
        except Exception as e:
            logger.warning(f"Failed to extract row {row_idx}: {e}")

    return records


def _map_headers_to_schema(headers: List[str]) -> Dict[int, str]:
    """Map column indices to schema field names based on header text."""
    mapping = {}
    for idx, header in enumerate(headers):
        if not header or not header.strip():
            continue
        normalized = normalize_column_name(header)
        # If the normalized name is in our known fields, map it
        known_fields = set(COLUMN_NAME_MAP.values())
        known_fields.add("serial_number")
        if normalized in known_fields:
            mapping[idx] = normalized
        else:
            # Try fuzzy header matching
            header_lower = header.strip().lower()
            best_match = _fuzzy_header_match(header_lower)
            if best_match:
                mapping[idx] = best_match
            else:
                mapping[idx] = f"unknown_{idx}"

    return mapping


def _fuzzy_header_match(header: str) -> Optional[str]:
    """Simple fuzzy matching for column headers."""
    header = header.lower().strip()

    # Check for key substrings
    if any(k in header for k in ["code", "no", "number", "item"]):
        if "hsn" in header or "sac" in header:
            return "hsn_sac_code"
        if "sl" in header or "sr" in header or "serial" in header or header in ["no", "no.", "#"]:
            return "serial_number"
        return "legacy_material_code"
    if any(k in header for k in ["desc", "name", "particular"]):
        return "material_description"
    if any(k in header for k in ["uom", "unit"]):
        return "uom"
    if any(k in header for k in ["group", "categ", "class", "type"]):
        return "material_group"
    if any(k in header for k in ["make", "brand", "mfr", "manuf"]):
        return "make_brand"
    if any(k in header for k in ["spec", "std", "standard"]):
        return "standard"
    if any(k in header for k in ["qty", "quant", "stock", "balance"]):
        return "quantity"
    if any(k in header for k in ["rate", "price", "cost"]):
        if "total" in header:
            return "total_value"
        return "unit_price"
    if any(k in header for k in ["total", "amount", "value"]):
        return "total_value"
    if any(k in header for k in ["hsn", "sac"]):
        return "hsn_sac_code"

    return None


def _extract_single_record(
    row: List[str],
    field_mapping: Dict[int, str],
    headers: List[str],
    source_file: str = "",
    source_page: int = 1,
    source_row: int = 0,
    base_ocr_confidence: float = 0.9,
) -> Optional[LegacyMaterialRecord]:
    """Extract a single record from a table row."""

    record = LegacyMaterialRecord(
        source_file=source_file,
        source_page=source_page,
        source_row=source_row,
    )

    # Track original OCR text
    original_texts = []
    field_confidences = []

    for col_idx, cell_text in enumerate(row):
        if col_idx not in field_mapping:
            continue

        field_name = field_mapping[col_idx]
        raw_text = str(cell_text).strip() if cell_text else ""

        if not raw_text or raw_text == "-" or raw_text.lower() == "nan":
            continue

        original_texts.append(f"{headers[col_idx] if col_idx < len(headers) else ''}: {raw_text}")

        # Apply OCR corrections
        corrected_text, corrections = apply_ocr_corrections(raw_text)
        if corrections:
            record.ocr_corrections.extend(corrections)

        # Map to schema fields
        if field_name == "legacy_material_code":
            record.legacy_material_code = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "material_description":
            record.material_description = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "material_group":
            record.material_group = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "uom":
            record.uom = normalize_uom(corrected_text)
            field_confidences.append(base_ocr_confidence)
        elif field_name == "make_brand":
            record.make_brand = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "standard":
            record.standard = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "hsn_sac_code":
            record.hsn_sac_code = corrected_text
            field_confidences.append(base_ocr_confidence)
        elif field_name == "quantity":
            record.quantity = _parse_numeric(corrected_text)
            conf = base_ocr_confidence if record.quantity is not None else 0.5
            field_confidences.append(conf)
        elif field_name == "unit_price":
            record.unit_price = _parse_numeric(corrected_text)
            conf = base_ocr_confidence if record.unit_price is not None else 0.5
            field_confidences.append(conf)
        elif field_name == "total_value":
            record.total_value = _parse_numeric(corrected_text)
            conf = base_ocr_confidence if record.total_value is not None else 0.5
            field_confidences.append(conf)
        elif field_name == "serial_number":
            pass  # Skip serial numbers
        else:
            pass

    # Extract engineering attributes from description
    desc_combined = f"{record.material_description} {record.standard}".strip()
    if desc_combined:
        eng_attrs = extract_engineering_attributes(desc_combined)
        if eng_attrs.get("material_grade") and not record.material_grade:
            record.material_grade = eng_attrs["material_grade"]
        if eng_attrs.get("pressure_class") and not record.pressure_class:
            record.pressure_class = eng_attrs["pressure_class"]
        if eng_attrs.get("dimensions") and not record.dimensions:
            record.dimensions = eng_attrs["dimensions"]
        if eng_attrs.get("schedule") and not record.schedule:
            record.schedule = eng_attrs["schedule"]
        if eng_attrs.get("standard") and not record.standard:
            record.standard = eng_attrs["standard"]
        if eng_attrs.get("material_group") and not record.material_group:
            record.material_group = eng_attrs["material_group"]

    # Auto-classify material group if empty
    if not record.material_group and record.material_description:
        record.material_group = classify_material_group(record.material_description)

    # Store original text
    record.original_ocr_text = " | ".join(original_texts)
    record.corrected_text = record.material_description

    # Calculate confidence scores
    record.ocr_confidence = round(base_ocr_confidence * 100, 1)
    record.extraction_confidence = _calculate_extraction_confidence(record, field_confidences)
    record.overall_confidence = round(
        (record.ocr_confidence * 0.5 + record.extraction_confidence * 0.5), 1
    )

    # Tri-tier classification
    if record.overall_confidence >= 95:
        record.validation_status = "GREEN"
        record.review_required = False
    elif record.overall_confidence >= 70:
        record.validation_status = "YELLOW"
        record.review_required = True
    else:
        record.validation_status = "RED"
        record.review_required = True

    record.reviewer_action = "PENDING" if record.review_required else "AUTO_APPROVED"

    return record


def _parse_numeric(text: str) -> Optional[float]:
    """Parse a numeric value from text, handling commas and currency symbols."""
    if not text:
        return None
    # Remove currency symbols, commas, spaces
    cleaned = re.sub(r'[₹$€£,\s]', '', text.strip())
    # Remove trailing non-numeric chars
    cleaned = re.sub(r'[^0-9.\-]', '', cleaned)
    try:
        val = float(cleaned)
        return val
    except (ValueError, TypeError):
        return None


def _calculate_extraction_confidence(record: LegacyMaterialRecord, field_confidences: List[float]) -> float:
    """Calculate extraction confidence based on field completeness and quality."""
    score = 0.0
    max_score = 0.0

    # Required fields (high weight)
    required_checks = [
        (record.legacy_material_code, 20),
        (record.material_description, 25),
        (record.uom, 10),
    ]

    # Optional but valuable fields
    optional_checks = [
        (record.material_group, 5),
        (record.make_brand, 5),
        (record.material_grade, 8),
        (record.standard, 8),
        (record.quantity is not None, 7),
        (record.unit_price is not None, 7),
        (record.dimensions, 5),
    ]

    for value, weight in required_checks:
        max_score += weight
        if value:
            score += weight

    for value, weight in optional_checks:
        max_score += weight
        if value:
            score += weight

    # Add field-level confidence average
    if field_confidences:
        avg_field_conf = sum(field_confidences) / len(field_confidences)
        score = score * avg_field_conf

    return round((score / max_score) * 100, 1) if max_score > 0 else 0.0
