export type CPSEEntity = 'CPCL' | 'IOCL' | 'ONGC' | 'BPCL' | 'HPCL' | 'SAIL' | 'NTPC' | 'MoPNG' | 'CVO_AUDIT';

export type UserRole =
  | 'MOPNG_GOVERNMENT'
  | 'CPSE_MANAGEMENT'
  | 'PROCUREMENT_TEAM'
  | 'ENGINEERING_EXPERT'
  | 'INVENTORY_TEAM'
  | 'IT_SAP_TEAM';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  cpse: CPSEEntity;
  plantLocation: string;
  role: UserRole;
  badgeId: string;
  avatarColor: string;
}

export interface MaterialRecord {
  rowId: number;
  cpseName: string;
  materialCodeCPSE: string;
  materialDescriptionRaw: string;
  specificationRaw: string;
  unitOfMeasurement: string;
  existingClassificationCode: string;
  plantLocation: string;
  annualProcuredQty: number;
  avgUnitPriceINR: number;
  vendorName: string;
  groundTruthClusterId: string;
  groundTruthStandardName: string;
  groundTruthNationalCode: string;
  // Computed Agent 1 Attributes
  extractedGrade?: string;
  extractedDimension?: string;
  extractedPressure?: string;
  extractedStandard?: string;
  materialGroup?: string;
  materialType?: string;
  manufacturingMethod?: string;
  nominalBore?: string;
  schedule?: string;
  surfaceFinish?: string;
  endType?: string;
  sourceSystem?: string;
  mappingStatus?: string;
  reviewRef?: string;
  approvedBy?: string;
  approvalDate?: string;
  version?: string;
  vectorSimilarity?: number;
  attributeSimilarity?: number;
  finalConfidence?: number;
  triageTier?: 'GREEN' | 'YELLOW' | 'RED';
  status?: 'SYNCED' | 'PENDING_REVIEW' | 'NEW_CODE' | 'REJECTED';
  dataQuality?: 'COMPLETE' | 'HIGH_QUALITY' | 'PARTIAL' | 'NEEDS_VERIFICATION';
}

export interface NationalMaterialMaster {
  nationalCode: string;
  standardizedName: string;
  unspscCode: string;
  unspscCategory: string;
  materialGroup?: string;
  standardSpec: string;
  materialGrade: string;
  dimensionSpec: string;
  pressureRating: string;
  baseUoM: string;
  materialType?: string;
  manufacturingMethod?: string;
  nominalBore?: string;
  schedule?: string;
  surfaceFinish?: string;
  endType?: string;
  totalMappedSKUs: number;
  participatingCPSEs: string[];
  lowestUnitPriceINR: number;
  highestUnitPriceINR: number;
  medianUnitPriceINR: number;
  annualTotalVolume: number;
  lifecycleStatus?: 'Active' | 'Deprecated' | 'Superseded' | string;
  status?: 'Approved' | 'Under Review' | 'Pending' | 'Rejected' | string;
  reviewRef?: string;
  approvedBy?: string;
  approvalDate?: string;
  effectiveFrom?: string;
  nextReviewDue?: string;
  version?: string;
  lastUpdated?: string;
  changeHistory?: {
    version: string;
    date: string;
    author: string;
    summary: string;
  }[];
  sha256Proof: string;
  dataQuality?: 'COMPLETE' | 'HIGH_QUALITY' | 'PARTIAL' | 'NEEDS_VERIFICATION';
  clusterId?: string;
  duplicateConsolidated?: boolean;
}

export interface XAIAttributeDiff {
  attributeName: string;
  localSpec: string;
  nationalSpec: string;
  isMatch: boolean;
  matchScore: string;
  weight: number;
}

export interface AdjudicationCandidate {
  id: string;
  localRecord: MaterialRecord;
  candidateMaster: NationalMaterialMaster;
  finalConfidence: number;
  vectorScore: number;
  attributeScore: number;
  radarScores: {
    dimensions: number;
    materialGrade: number;
    pressureClass: number;
    standardCode: number;
    uomConsistency: number;
  };
  xaiDiffs: XAIAttributeDiff[];
  historicalRates: {
    cpseName: string;
    rate: number;
    annualQty: number;
  }[];
  potentialSavingsPercent: number;
  potentialSavingsINR: number;
}

export interface AuditLedgerBlock {
  blockIndex: number;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  actor: string;
  actionType: 'AUTO_LINK' | 'MANUAL_APPROVE' | 'SAP_SYNC' | 'DRIFT_DETECTED' | 'NEW_CODE_GEN';
  nationalCode: string;
  cpseCode: string;
  cpseName: string;
  payloadSummary: string;
}

export interface DriftAlertItem {
  id: string;
  timestamp: string;
  cpseName: string;
  plantLocation: string;
  materialCode: string;
  nationalCode: string;
  severity: 'LEVEL_1_COSMETIC' | 'LEVEL_2_TOLERANCE' | 'LEVEL_3_ROGUE_OVERRIDE';
  driftDescription: string;
  fieldAltered: string;
  originalValue: string;
  driftedValue: string;
  status: 'ACTIVE_ALERT' | 'REVERTED' | 'APPROVED_CHANGE';
}

export interface OCRInspectionItem {
  id: string;
  filename: string;
  pageNumber: number;
  rawCropText: string;
  confidenceScore: number;
  flaggedLowConfidence: boolean;
  extractedJSON: Record<string, string>;
  spellCorrections: {
    rawToken: string;
    correctedToken: string;
    dictionaryMatch: string;
    confidence: number;
  }[];
}

// ==================== LEGACY MIGRATION TYPES ====================

export interface LegacyMaterialRecord {
  record_id: string;
  legacy_material_code: string;
  material_description: string;
  material_group: string;
  uom: string;
  make_brand: string;
  material_grade: string;
  dimensions: string;
  pressure_class: string;
  schedule: string;
  standard: string;
  tolerance: string;
  hsn_sac_code: string;
  quantity: number | null;
  unit_price: number | null;
  total_value: number | null;
  source_file: string;
  source_page?: number | null;
  source_row?: number | null;
  bounding_box?: Record<string, number> | null;
  original_ocr_text: string;
  corrected_text: string;
  ocr_corrections: {
    original: string;
    corrected: string;
    reason: string;
    confidence: number;
    dictionary_source?: string;
  }[];
  ocr_confidence: number;
  extraction_confidence: number;
  overall_confidence: number;
  validation_status: 'GREEN' | 'YELLOW' | 'RED';
  review_required: boolean;
  reviewer_action: string;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'skipped' | 'error';
}

export interface MigrationJob {
  migration_id: string;
  source_filename: string;
  source_type: 'IMAGE' | 'PDF' | 'CSV' | 'EXCEL' | 'UNKNOWN';
  upload_timestamp: string;
  uploaded_by: string;
  document_type: 'PRINTED' | 'HANDWRITTEN' | 'SPREADSHEET' | 'MIXED' | '';
  page_count: number;
  records_detected: number;
  records_extracted: number;
  records_approved: number;
  records_rejected: number;
  records_pending_review: number;
  average_ocr_confidence: number;
  processing_status: 'UPLOADED' | 'PROCESSING' | 'REVIEW_REQUIRED' | 'APPROVED' | 'IMPORTED' | 'FAILED';
  processing_duration: number;
  processing_progress: number;
  current_step: string;
  error_count: number;
  errors: string[];
  pipeline_steps: PipelineStep[];
}

export interface MigrationPreview {
  migration_id: string;
  source_filename: string;
  source_type: string;
  document_type: string;
  total_records: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
  average_confidence: number;
  processing_status: string;
  records: LegacyMaterialRecord[];
}

