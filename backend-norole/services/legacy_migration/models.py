"""
Pydantic models for the Legacy Migration Agent.
Defines the standard material schema, migration job registry, and audit types.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class LegacyMaterialRecord(BaseModel):
    """Standard normalized material record extracted from legacy documents."""
    record_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    legacy_material_code: str = ""
    material_description: str = ""
    material_group: str = ""
    uom: str = ""
    make_brand: str = ""
    material_grade: str = ""
    dimensions: str = ""
    pressure_class: str = ""
    schedule: str = ""
    standard: str = ""
    tolerance: str = ""
    hsn_sac_code: str = ""
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_value: Optional[float] = None

    # Source traceability
    source_file: str = ""
    source_page: Optional[int] = None
    source_row: Optional[int] = None
    bounding_box: Optional[Dict[str, int]] = None

    # OCR audit trail
    original_ocr_text: str = ""
    corrected_text: str = ""
    ocr_corrections: List[Dict[str, Any]] = Field(default_factory=list)

    # Confidence & status
    ocr_confidence: float = 0.0
    extraction_confidence: float = 0.0
    overall_confidence: float = 0.0
    validation_status: str = ""  # GREEN, YELLOW, RED
    review_required: bool = False
    reviewer_action: str = ""  # APPROVED, REJECTED, CORRECTED, PENDING


class MigrationJob(BaseModel):
    """Persistent registry entry for a legacy migration job."""
    migration_id: str = Field(default_factory=lambda: f"MIG-{str(uuid.uuid4())[:8].upper()}")
    source_filename: str = ""
    source_type: str = ""  # IMAGE, PDF, CSV, EXCEL
    upload_timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"))
    uploaded_by: str = "system"
    document_type: str = ""  # PRINTED, HANDWRITTEN, SPREADSHEET, MIXED
    page_count: int = 1
    records_detected: int = 0
    records_extracted: int = 0
    records_approved: int = 0
    records_rejected: int = 0
    records_pending_review: int = 0
    average_ocr_confidence: float = 0.0
    processing_status: str = "UPLOADED"
    # UPLOADED, PREPROCESSING, OCR_PROCESSING, TABLE_DETECTION,
    # EXTRACTION, NORMALIZATION, VALIDATION, SCORING,
    # REVIEW_REQUIRED, APPROVED, IMPORTED, FAILED
    processing_duration: float = 0.0
    processing_progress: int = 0  # 0-100
    current_step: str = ""
    error_count: int = 0
    errors: List[str] = Field(default_factory=list)

    # Pipeline step statuses
    pipeline_steps: List[Dict[str, str]] = Field(default_factory=lambda: [
        {"name": "Upload", "status": "pending"},
        {"name": "Preprocess", "status": "pending"},
        {"name": "OCR", "status": "pending"},
        {"name": "Table Detection", "status": "pending"},
        {"name": "Attribute Extraction", "status": "pending"},
        {"name": "Engineering Normalization", "status": "pending"},
        {"name": "Validation", "status": "pending"},
        {"name": "Confidence Scoring", "status": "pending"},
        {"name": "Review", "status": "pending"},
    ])


class OCRCorrection(BaseModel):
    """Audit record for a single OCR correction."""
    original: str
    corrected: str
    reason: str
    confidence: float
    dictionary_source: str = ""


class AuditLogEntry(BaseModel):
    """Modification audit trail entry."""
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S IST"))
    user: str = "system"
    action: str = ""  # UPLOAD, OCR, CORRECTION, REVIEW, APPROVAL, REJECTION, IMPORT
    migration_id: str = ""
    record_id: str = ""
    field: str = ""
    before_value: str = ""
    after_value: str = ""
    reason: str = ""
