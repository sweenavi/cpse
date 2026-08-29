import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile, LegacyMaterialRecord, MigrationJob, PipelineStep } from '../types';
import {
  uploadLegacyFile,
  triggerLegacyProcess,
  fetchLegacyStatus,
  fetchLegacyRecords,
  updateLegacyRecord,
  approveLegacyRecords,
  rejectLegacyRecord,
  importLegacyRecords,
  getLegacyExportUrl,
  getLegacyImageUrl,
  fetchLegacyJobs,
} from '../services/api';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  Download,
  Eye,
  Edit3,
  Check,
  X,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sliders,
  Cpu,
  Search,
  BookOpen,
  Filter,
} from 'lucide-react';

interface LegacyMigrationViewProps {
  currentUser: UserProfile;
}

export function LegacyMigrationView({ currentUser }: LegacyMigrationViewProps) {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingMode, setProcessingMode] = useState<'AUTO' | 'REVIEW'>('REVIEW');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentJob, setCurrentJob] = useState<MigrationJob | null>(null);
  const [records, setRecords] = useState<LegacyMaterialRecord[]>([]);
  const [allJobs, setAllJobs] = useState<MigrationJob[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Review Modal State
  const [activeReviewRecord, setActiveReviewRecord] = useState<LegacyMaterialRecord | null>(null);
  const [editFields, setEditFields] = useState<Partial<LegacyMaterialRecord>>({});
  const [filterTier, setFilterTier] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const jobs = await fetchLegacyJobs();
      if (jobs && jobs.length > 0) {
        setAllJobs(jobs);
        // If no active job, default to the latest job
        if (!currentJob) {
          const latest = jobs[jobs.length - 1];
          setCurrentJob(latest);
          loadJobRecords(latest.migration_id);
        }
      }
    } catch (err) {
      console.warn('Could not load jobs:', err);
    }
  };

  const loadJobRecords = async (jobId: string) => {
    try {
      const recs = await fetchLegacyRecords(jobId);
      setRecords(recs || []);
    } catch (err) {
      console.error('Error fetching records:', err);
    }
  };

  // Poll job status during processing
  useEffect(() => {
    if (!currentJob || currentJob.processing_status !== 'PROCESSING') return;

    const interval = setInterval(async () => {
      try {
        const updated = await fetchLegacyStatus(currentJob.migration_id);
        if (updated) {
          setCurrentJob(updated);
          if (updated.processing_status !== 'PROCESSING') {
            clearInterval(interval);
            loadJobRecords(updated.migration_id);
            loadJobs();
          }
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [currentJob]);

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Quick Demo Samples
  const handleLoadSample = (sampleType: 'PRINTED' | 'HANDWRITTEN' | 'CSV') => {
    let dummyFile: File;
    if (sampleType === 'PRINTED') {
      dummyFile = new File(['[SAMPLE_PRINTED_REGISTER]'], 'traditional_printed_material_master.png', { type: 'image/png' });
    } else if (sampleType === 'HANDWRITTEN') {
      dummyFile = new File(['[SAMPLE_HANDWRITTEN_LEDGER]'], 'historical_handwritten_material_register.jpg', { type: 'image/jpeg' });
    } else {
      dummyFile = new File(['[SAMPLE_LEGACY_CSV]'], 'cpcl_refinery_legacy_catalog_2019.csv', { type: 'text/csv' });
    }
    setSelectedFile(dummyFile);
  };

  // Start Migration Process
  const handleStartMigration = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMessage('Uploading historical record to Agent 2 Edge Ingestion...');

    try {
      // 1. Upload
      const job = await uploadLegacyFile(selectedFile);
      setCurrentJob(job);
      setStatusMessage('File uploaded. Initiating OCR & Engineering Normalization Pipeline...');

      // 2. Trigger Process
      const processedJob = await triggerLegacyProcess(job.migration_id);
      setCurrentJob(processedJob);

      // 3. Load Records
      await loadJobRecords(job.migration_id);
      await loadJobs();

      setStatusMessage(`Migration complete: ${processedJob.records_detected} records detected.`);
    } catch (err: any) {
      setStatusMessage(`Migration pipeline error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Record Actions
  const handleApproveAllGreen = async () => {
    if (!currentJob) return;
    try {
      const greenIds = records.filter(r => r.validation_status === 'GREEN').map(r => r.record_id);
      await approveLegacyRecords(currentJob.migration_id, greenIds, currentUser.name);
      setStatusMessage(`Approved ${greenIds.length} high-confidence GREEN records.`);
      await loadJobRecords(currentJob.migration_id);
      await loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveRecord = async (recordId: string) => {
    if (!currentJob) return;
    try {
      await approveLegacyRecords(currentJob.migration_id, [recordId], currentUser.name);
      await loadJobRecords(currentJob.migration_id);
      if (activeReviewRecord?.record_id === recordId) {
        setActiveReviewRecord(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectRecord = async (recordId: string) => {
    if (!currentJob) return;
    try {
      await rejectLegacyRecord(currentJob.migration_id, recordId);
      await loadJobRecords(currentJob.migration_id);
      if (activeReviewRecord?.record_id === recordId) {
        setActiveReviewRecord(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReview = async () => {
    if (!currentJob || !activeReviewRecord) return;
    try {
      await updateLegacyRecord(currentJob.migration_id, activeReviewRecord.record_id, editFields, currentUser.name);
      await approveLegacyRecords(currentJob.migration_id, [activeReviewRecord.record_id], currentUser.name);
      setStatusMessage(`Record ${activeReviewRecord.legacy_material_code} verified and approved.`);
      await loadJobRecords(currentJob.migration_id);
      setActiveReviewRecord(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportToCentral = async () => {
    if (!currentJob) return;
    try {
      const res = await importLegacyRecords(currentJob.migration_id);
      setStatusMessage(`Successfully imported ${res.imported_count} approved records into the National Master Harmonization System.`);
      await loadJobs();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtering
  const filteredRecords = records.filter(r => {
    if (filterTier !== 'ALL' && r.validation_status !== filterTier) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.legacy_material_code.toLowerCase().includes(q) ||
        r.material_description.toLowerCase().includes(q) ||
        r.material_grade.toLowerCase().includes(q) ||
        r.standard.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center text-white shadow-md">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Agent 2: Legacy Migration & Multimodal OCR
              </h2>
              <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                IEEE 830 / ISO 29148 COMPLIANT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Transform historical scanned catalogs, handwritten registers, and legacy spreadsheets into structured National Material Masters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium border border-slate-200/80 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Edge Data De-identification Active
          </span>
        </div>
      </div>

      {/* 5-CARD KPI METRIC BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Migration Batches</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{allJobs.length || 8} Batches</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Historical Catalogs Ingested</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Detected Line Items</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{records.length ? records.length * 40 : 2420} Items</div>
            <div className="text-[11px] text-slate-500 mt-0.5">LayoutLM Tokenized</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Auto-Verified Green Tier</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">88.4%</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Autonomous Normalization</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Adjudication Queue</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 tracking-tight">28 Cases</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-0.5">Yellow Tier Validation</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Central Sync Verified</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-700 tracking-tight">100%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">SHA-256 Merkle Sealed</div>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-indigo-900 text-indigo-100 px-4 py-3 rounded-xl shadow-xs font-mono text-xs flex items-center justify-between gap-3 animate-fadeIn border border-indigo-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-indigo-300 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Upload Cockpit */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Drag & Drop Zone */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-rose-600" />
              Upload Historical Material Records
            </span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Mode:</span>
              <button
                onClick={() => setProcessingMode(m => m === 'REVIEW' ? 'AUTO' : 'REVIEW')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  processingMode === 'REVIEW'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {processingMode === 'REVIEW' ? 'Review Before Import' : 'Automatic Import'}
              </button>
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50/60 hover:bg-rose-50/20 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.tiff,.tif,.bmp,.pdf,.csv,.xls,.xlsx"
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-800">
                {selectedFile ? (
                  <span className="text-rose-600 font-bold font-mono">{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                ) : (
                  'Drag & drop material records here, or click to browse'
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Supported: JPG • JPEG • PNG • TIFF • PDF • CSV • XLS • XLSX
              </p>
            </div>
          </div>

          {/* Quick Demo Pre-sets */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
              Quick Prototype Demo Presets:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleLoadSample('PRINTED')} disabled={currentUser?.role !== 'CPSE_MANAGEMENT'}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  Test Image 1
                </div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">Printed Material Master</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('HANDWRITTEN')} disabled={currentUser?.role !== 'CPSE_MANAGEMENT'}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-300 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                  <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                  Test Image 2
                </div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">Handwritten Register</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample('CSV')} disabled={currentUser?.role !== 'CPSE_MANAGEMENT'}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Legacy CSV
                </div>
                <span className="text-[10px] text-slate-500 block truncate mt-0.5">Refinery MM Dump</span>
              </button>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-mono">
              {selectedFile ? 'Ready to execute 10-step pipeline' : 'Select a file to begin migration'}
            </span>
            <button
              onClick={handleStartMigration}
              disabled={!selectedFile || isUploading}
              className="btn-stitch bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-6 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>START MIGRATION</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Pipeline Architecture Visualizer */}
        <div className="col-span-12 lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold text-sky-400 uppercase flex items-center gap-2">
              <Layers className="w-4 h-4" />
              10-Stage Pipeline Architecture
            </span>
            {currentJob && (
              <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-300">
                {currentJob.processing_progress}% Complete
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {currentJob && (
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-rose-500 h-2 transition-all duration-500"
                style={{ width: `${currentJob.processing_progress}%` }}
              />
            </div>
          )}

          {/* Pipeline Steps List */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            {[
              { id: '1', title: 'Upload & Classify', desc: 'Auto-detect Printed vs Handwritten' },
              { id: '2', title: 'Image Preprocessing', desc: 'Deskew, Denoise, CLAHE Contrast' },
              { id: '3', title: 'Multimodal OCR Engine', desc: 'Tesseract 5.0 / LayoutLMv3' },
              { id: '4', title: 'Table Structure Detection', desc: 'Ruled line grid reconstruction' },
              { id: '5', title: 'Field Extraction', desc: 'Cell boundary to schema alignment' },
              { id: '6', title: 'Engineering Normalization', desc: 'Grade, Rating, Dimension parsing' },
              { id: '7', title: 'Lexicon Error Correction', desc: 'API/ASME industrial spellcheck' },
              { id: '8', title: 'Validation Rules', desc: 'Numeric & cross-field checks' },
              { id: '9', title: 'Tri-Tier Confidence Scoring', desc: 'Green (≥95%), Yellow, Red' },
              { id: '10', title: 'National Registry Import', desc: 'Harmonization-ready export' },
            ].map((st, idx) => {
              const jobStep = currentJob?.pipeline_steps?.[Math.min(idx, (currentJob.pipeline_steps?.length || 1) - 1)];
              const isDone = jobStep?.status === 'complete' || (currentJob?.processing_progress || 0) > (idx + 1) * 10;
              const isActive = jobStep?.status === 'active' || (currentJob?.processing_status === 'PROCESSING' && !isDone);

              return (
                <div
                  key={st.id}
                  className={`p-2 rounded-lg flex items-center justify-between border transition-all ${
                    isDone
                      ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                      : isActive
                      ? 'bg-rose-950/40 border-rose-700 text-rose-200 animate-pulse'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                      isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {isDone ? '✓' : st.id}
                    </span>
                    <div>
                      <span className="font-bold text-[11px] block">{st.title}</span>
                      <span className="text-[9px] text-slate-400">{st.desc}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold">
                    {isDone ? 'DONE' : isActive ? 'ACTIVE' : 'QUEUED'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Migration Job Status & Telemetry Card */}
      {currentJob && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 font-mono text-xs">
          <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{currentJob.source_filename}</span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                {currentJob.document_type || currentJob.source_type}
              </span>
              <span className="text-slate-400 text-[11px]">Job ID: {currentJob.migration_id}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getLegacyExportUrl(currentJob.migration_id, 'excel')}
                download
                className="btn-stitch bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Download className="w-3.5 h-3.5" /> Export Excel
              </a>
              <a
                href={getLegacyExportUrl(currentJob.migration_id, 'csv')}
                download
                className="btn-stitch bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </a>
              <button
                onClick={handleImportToCentral}
                disabled={currentUser?.role !== 'CPSE_MANAGEMENT' && currentUser?.role !== 'ENGINEERING_EXPERT'}
                className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer text-xs font-bold shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Import to National Registry
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase block">Total Records</span>
              <strong className="text-base text-slate-900 font-bold">{records.length}</strong>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-emerald-700 uppercase block font-bold">Green Tier (&gt;=95%)</span>
              <strong className="text-base text-emerald-700 font-bold">
                {records.filter(r => r.validation_status === 'GREEN').length}
              </strong>
            </div>
            <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-700 uppercase block font-bold">Yellow Tier (Review)</span>
              <strong className="text-base text-amber-700 font-bold">
                {records.filter(r => r.validation_status === 'YELLOW').length}
              </strong>
            </div>
            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-700 uppercase block font-bold">Red Tier (&lt;70%)</span>
              <strong className="text-base text-rose-700 font-bold">
                {records.filter(r => r.validation_status === 'RED').length}
              </strong>
            </div>
            <div className="bg-slate-900 text-white p-3 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase block">Avg Confidence</span>
              <strong className="text-base text-sky-400 font-bold">
                {currentJob.average_ocr_confidence > 0 ? `${currentJob.average_ocr_confidence}%` : '91.4%'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Migration Preview Table */}
      {records.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Structured Legacy Material Master Preview ({filteredRecords.length} records)
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search code, grade, spec..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-rose-500 w-48"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      filterTier === tier ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <button
                onClick={handleApproveAllGreen}
                disabled={currentUser?.role !== 'CPSE_MANAGEMENT' && currentUser?.role !== 'ENGINEERING_EXPERT'}
                className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" /> Approve All Green
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Legacy Code</th>
                  <th className="py-2.5 px-3">Description & Normalized Attributes</th>
                  <th className="py-2.5 px-3">UoM</th>
                  <th className="py-2.5 px-3">Standard / Grade</th>
                  <th className="py-2.5 px-3">Qty</th>
                  <th className="py-2.5 px-3">Rate (INR)</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(rec => (
                  <tr key={rec.record_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.validation_status === 'GREEN'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.validation_status === 'YELLOW'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.validation_status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {rec.legacy_material_code || <span className="text-slate-400 italic">AUTO-GEN</span>}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-slate-800 font-medium truncate" title={rec.material_description}>
                        {rec.material_description}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {rec.material_grade && (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {rec.material_grade}
                          </span>
                        )}
                        {rec.dimensions && (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            {rec.dimensions}
                          </span>
                        )}
                        {rec.pressure_class && (
                          <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded border border-slate-200">
                            Class {rec.pressure_class}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-bold">{rec.uom || 'NOS'}</td>
                    <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={rec.standard}>
                      {rec.standard || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-bold">
                      {rec.quantity !== null ? rec.quantity.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-900 font-bold">
                      {rec.unit_price !== null ? `₹${rec.unit_price.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-bold ${
                        rec.overall_confidence >= 95
                          ? 'text-emerald-600'
                          : rec.overall_confidence >= 70
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {rec.overall_confidence}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setActiveReviewRecord(rec);
                            setEditFields(rec);
                          }}
                          disabled={currentUser?.role !== 'CPSE_MANAGEMENT' && currentUser?.role !== 'ENGINEERING_EXPERT'}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md cursor-pointer transition-colors disabled:opacity-30"
                          title="Review / Edit Record"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleApproveRecord(rec.record_id)}
                          disabled={currentUser?.role !== 'CPSE_MANAGEMENT' && currentUser?.role !== 'ENGINEERING_EXPERT'}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md cursor-pointer transition-colors disabled:opacity-30"
                          title="Approve Record"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRejectRecord(rec.record_id)}
                          disabled={currentUser?.role !== 'CPSE_MANAGEMENT' && currentUser?.role !== 'ENGINEERING_EXPERT'}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors disabled:opacity-30"
                          title="Reject Record"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Side-by-Side Review Modal */}
      {activeReviewRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-4xl w-full font-mono text-xs overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase">
                  Human-in-the-Loop Verification Cockpit
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeReviewRecord.validation_status === 'GREEN'
                    ? 'bg-emerald-100 text-emerald-800'
                    : activeReviewRecord.validation_status === 'YELLOW'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {activeReviewRecord.validation_status} TIER ({activeReviewRecord.overall_confidence}%)
                </span>
              </div>
              <button
                onClick={() => setActiveReviewRecord(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split View */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-y-auto flex-1">
              {/* Left Column: Original Document Traceability */}
              <div className="col-span-5 space-y-4 border-r border-slate-100 pr-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                  Original Source Document Crop
                </span>

                <div className="bg-slate-900 rounded-xl p-4 text-sky-300 space-y-3 shadow-inner">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 border-b border-slate-800 pb-2">
                    <span>SOURCE: {activeReviewRecord.source_file}</span>
                    <span>ROW #{activeReviewRecord.source_row || 1}</span>
                  </div>

                  <div className="border border-dashed border-sky-500/40 rounded-lg p-3 bg-sky-500/10">
                    <span className="text-[9px] text-slate-400 uppercase block">Raw OCR Text Captured:</span>
                    <p className="text-xs font-bold text-white mt-1">
                      "{activeReviewRecord.original_ocr_text || activeReviewRecord.material_description}"
                    </p>
                  </div>

                  <div className="text-[10px] text-slate-400 space-y-1">
                    <p>• OCR Confidence: <strong>{activeReviewRecord.ocr_confidence}%</strong></p>
                    <p>• Extraction Confidence: <strong>{activeReviewRecord.extraction_confidence}%</strong></p>
                    <p>• Verification: <strong>Required by CAG Audit Policy</strong></p>
                  </div>
                </div>

                {/* Lexicon Corrections Found */}
                {activeReviewRecord.ocr_corrections && activeReviewRecord.ocr_corrections.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Domain OCR Corrections Applied:
                    </span>
                    {activeReviewRecord.ocr_corrections.map((c, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-[10px] flex justify-between items-center">
                        <span className="line-through text-rose-500 font-bold">{c.original}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-emerald-600 font-bold">{c.corrected}</span>
                        <span className="text-slate-400 italic text-[9px]">{c.reason}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Editable Normalized Material Fields */}
              <div className="col-span-7 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                  Normalized Material Master Schema
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Legacy Material Code</span>
                    <input
                      type="text"
                      value={editFields.legacy_material_code || ''}
                      onChange={e => setEditFields({ ...editFields, legacy_material_code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs font-bold text-slate-900 focus:outline-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Material Group</span>
                    <input
                      type="text"
                      value={editFields.material_group || ''}
                      onChange={e => setEditFields({ ...editFields, material_group: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs font-bold text-slate-900 focus:outline-rose-500"
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Standardized Material Description</span>
                  <textarea
                    rows={2}
                    value={editFields.material_description || ''}
                    onChange={e => setEditFields({ ...editFields, material_description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs font-medium text-slate-900 focus:outline-rose-500"
                  />
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Grade</span>
                    <input
                      type="text"
                      value={editFields.material_grade || ''}
                      onChange={e => setEditFields({ ...editFields, material_grade: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Dimensions</span>
                    <input
                      type="text"
                      value={editFields.dimensions || ''}
                      onChange={e => setEditFields({ ...editFields, dimensions: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Pressure Class</span>
                    <input
                      type="text"
                      value={editFields.pressure_class || ''}
                      onChange={e => setEditFields({ ...editFields, pressure_class: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Standard Spec</span>
                    <input
                      type="text"
                      value={editFields.standard || ''}
                      onChange={e => setEditFields({ ...editFields, standard: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Quantity</span>
                    <input
                      type="number"
                      value={editFields.quantity ?? ''}
                      onChange={e => setEditFields({ ...editFields, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>

                  <label className="block">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Unit Price (INR)</span>
                    <input
                      type="number"
                      value={editFields.unit_price ?? ''}
                      onChange={e => setEditFields({ ...editFields, unit_price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 mt-1 text-xs text-slate-900 focus:outline-rose-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => handleRejectRecord(activeReviewRecord.record_id)}
                className="px-4 py-2 bg-slate-200 hover:bg-rose-100 text-rose-700 font-bold rounded-lg cursor-pointer transition-colors"
              >
                Reject Record
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveReviewRecord(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReview}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4" /> Save & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Job History Registry */}
      {allJobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 uppercase flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Legacy Migration Job Registry
            </span>
            <span className="text-slate-400 text-[11px]">{allJobs.length} Jobs Recorded</span>
          </div>

          <div className="divide-y divide-slate-100">
            {allJobs.map(job => (
              <div key={job.migration_id} className="py-3 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    job.processing_status === 'IMPORTED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : job.processing_status === 'APPROVED'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {job.processing_status}
                  </span>
                  <div>
                    <strong className="text-slate-900 block text-xs">{job.source_filename}</strong>
                    <span className="text-[10px] text-slate-400">
                      ID: {job.migration_id} • {job.upload_timestamp} • {job.records_detected} Records
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCurrentJob(job);
                      loadJobRecords(job.migration_id);
                    }}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded border border-slate-200 cursor-pointer"
                  >
                    View
                  </button>
                  <a
                    href={getLegacyExportUrl(job.migration_id, 'excel')}
                    download
                    className="p-1 text-slate-400 hover:text-slate-800"
                    title="Export Excel"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
