"""
Legacy Migration API Routes.
Separate router to keep main.py clean — will be included via app.include_router().
"""

import os
import io
from typing import List, Dict, Any, Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from auth_middleware import get_current_user, verify_user_permission
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

from services.legacy_migration.migration_service import (
    create_migration,
    process_migration,
    get_migration_status,
    get_migration_records,
    get_migration_preview,
    update_record,
    approve_records,
    reject_record,
    import_approved_records,
    export_records_excel,
    export_records_csv,
    get_all_jobs,
    get_uploaded_image_path,
    MIGRATION_STATE,
)

router = APIRouter(prefix="/api/legacy-migration", tags=["Legacy Migration"])


@router.post("/upload")
async def upload_legacy_file(file: UploadFile = File(...), user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.upload")
    """Upload a file and create a migration job."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    job = create_migration(file_bytes, file.filename)

    if job.processing_status == "FAILED":
        raise HTTPException(status_code=400, detail=job.errors[0] if job.errors else "Unsupported file type")

    return job.model_dump()


@router.post("/{migration_id}/process")
async def trigger_processing(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.process")
    """Trigger the processing pipeline for a migration job."""
    try:
        job = process_migration(migration_id)
        return job.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{migration_id}/status")
async def check_status(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.view")
    """Check the current status of a migration job."""
    job = get_migration_status(migration_id)
    if not job:
        raise HTTPException(status_code=404, detail="Migration job not found")
    return job.model_dump()


@router.get("/{migration_id}/records")
async def list_records(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.view")
    """Get all extracted records for a migration job."""
    records = get_migration_records(migration_id)
    return [r.model_dump() for r in records]


@router.get("/{migration_id}/preview")
async def preview_migration(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.view")
    """Get migration preview summary."""
    preview = get_migration_preview(migration_id)
    if not preview:
        raise HTTPException(status_code=404, detail="Migration job not found")
    return preview


class RecordUpdateRequest(BaseModel):
    updates: Dict[str, Any]
    user: str = "reviewer"


@router.put("/{migration_id}/records/{record_id}")
async def edit_record(migration_id: str, record_id: str, body: RecordUpdateRequest, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.correct")
    """Edit a single extracted record."""
    updated = update_record(migration_id, record_id, body.updates, body.user)
    if not updated:
        raise HTTPException(status_code=404, detail="Record not found")
    return updated.model_dump()


class ApproveRequest(BaseModel):
    record_ids: List[str] = []
    user: str = "reviewer"


@router.post("/{migration_id}/approve")
async def approve_migration_records(migration_id: str, body: ApproveRequest, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.approve")
    """Approve selected records (empty list = approve all GREEN)."""
    result = approve_records(migration_id, body.record_ids, body.user)
    return result


@router.post("/{migration_id}/reject/{record_id}")
async def reject_migration_record(migration_id: str, record_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.approve")
    """Reject a single record."""
    success = reject_record(migration_id, record_id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"status": "REJECTED"}


@router.post("/{migration_id}/import")
async def import_records(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.import")
    """Import approved records into the main material harmonization system."""
    result = import_approved_records(migration_id)
    
    # Dynamically inject into main state
    try:
        from main import STATE
        from services.audit_ledger import ledger_instance
        
        imported_records = result.get("records", [])
        if imported_records:
            new_registry_records = []
            for idx, r in enumerate(imported_records):
                rec_id = len(STATE["records"]) + idx + 1
                
                # Extract CPSE from filename or default to CPCL
                filename = r.get("source_file", "")
                cpse = "CPCL"
                if "iocl" in filename.lower():
                    cpse = "IOCL"
                elif "ongc" in filename.lower():
                    cpse = "ONGC"
                elif "bpcl" in filename.lower():
                    cpse = "BPCL"
                elif "hpcl" in filename.lower():
                    cpse = "HPCL"
                elif "sail" in filename.lower():
                    cpse = "SAIL"
                    
                qty = r.get("quantity") or 100.0
                price = r.get("unit_price") or 500.0
                nat_code = f"CNM-{str(rec_id).zfill(6)}"
                
                # Add to main CPSE records list
                item = {
                    "rowId": rec_id,
                    "cpseName": cpse,
                    "materialCodeCPSE": r.get("legacy_material_code") or f"LEG-{rec_id}",
                    "materialDescriptionRaw": r.get("material_description") or "",
                    "specificationRaw": r.get("standard") or "-",
                    "unitOfMeasurement": r.get("uom") or "NOS",
                    "existingClassificationCode": "MIGRATED",
                    "plantLocation": r.get("source_file") or "Legacy Import",
                    "annualProcuredQty": qty,
                    "avgUnitPriceINR": price,
                    "vendorName": r.get("make_brand") or "-",
                    "groundTruthClusterId": f"CLU-MIG-{rec_id}",
                    "groundTruthStandardName": r.get("material_description") or "",
                    "groundTruthNationalCode": nat_code,
                    "extractedGrade": r.get("material_grade") or "-",
                    "extractedDimension": r.get("dimensions") or "-",
                    "extractedPressure": r.get("pressure_class") or "-",
                    "extractedStandard": r.get("standard") or "-",
                    "vectorSimilarity": 0.96,
                    "attributeSimilarity": 0.97,
                    "finalConfidence": 0.965,
                    "triageTier": "GREEN",
                    "status": "SYNCED"
                }
                new_registry_records.append(item)
                
                # Add to masters list
                new_master = {
                    "nationalCode": nat_code,
                    "standardizedName": r.get("material_description") or "",
                    "unspscCode": "40141600",
                    "unspscCategory": "Industrial Supplies",
                    "materialGrade": r.get("material_grade") or "-",
                    "dimensionSpec": r.get("dimensions") or "-",
                    "pressureRating": r.get("pressure_class") or "-",
                    "standardSpec": r.get("standard") or "-",
                    "baseUoM": r.get("uom") or "NOS",
                    "totalMappedSKUs": 1,
                    "participatingCPSEs": [cpse],
                    "lowestUnitPriceINR": price,
                    "highestUnitPriceINR": price,
                    "medianUnitPriceINR": price,
                    "annualTotalVolume": qty,
                    "sha256Proof": ledger_instance.blocks[-1]["currentHash"] if ledger_instance.blocks else "MOCK-HASH"
                }
                STATE["masters"].insert(0, new_master)
                
            STATE["records"].extend(new_registry_records)
            
            # Log to cryptographic ledger
            ledger_instance.add_block(
                actor="Legacy-Migration-Agent-2",
                action_type="LEGACY_IMPORT_BATCH",
                payload_summary=f"Imported {len(new_registry_records)} records from legacy migration job {migration_id}.",
                details={"migrationId": migration_id, "recordCount": len(new_registry_records)}
            )
            
    except Exception as e:
        print(f"Error appending imported records to global state: {e}")
        
    return result


@router.get("/{migration_id}/export")
async def export_records(migration_id: str, format: str = "excel", user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.export")
    """Export records as Excel or CSV."""
    if format == "csv":
        csv_str = export_records_csv(migration_id)
        if not csv_str:
            raise HTTPException(status_code=404, detail="No records to export")
        return StreamingResponse(
            iter([csv_str]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=legacy_migration_{migration_id}.csv"}
        )
    else:
        excel_bytes = export_records_excel(migration_id)
        if not excel_bytes:
            raise HTTPException(status_code=404, detail="No records to export")
        return StreamingResponse(
            io.BytesIO(excel_bytes),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename=legacy_migration_{migration_id}.xlsx"}
        )


@router.get("/jobs")
async def list_all_jobs(user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.view")
    """List all migration jobs."""
    jobs = get_all_jobs()
    return [j.model_dump() for j in jobs]


@router.get("/{migration_id}/image")
async def get_original_image(migration_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    verify_user_permission(user, "migration.view")
    """Serve the original uploaded image for review UI."""
    path = get_uploaded_image_path(migration_id)
    if not path or not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)
