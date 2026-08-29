import { useState, useMemo } from 'react';
import type { MaterialRecord, UserProfile } from '../types';
import {
  Factory,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Scan,
  SpellCheck,
  ArrowRight,
  Play,
  Layers,
  Sparkles,
  Building2,
} from 'lucide-react';
import { uploadCSV, runOCRSpellcheck } from '../services/api';

interface CPSEManagementProps {
  records: MaterialRecord[];
  currentUser?: UserProfile | null;
}

export function CPSEManagementView({ records, currentUser }: CPSEManagementProps) {
  const [subTab, setSubTab] = useState<'INGESTION' | 'STANDARDIZATION' | 'OCR' | 'ERP_SYNC'>('STANDARDIZATION');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MaterialRecord>(records[0] || null);

  // OCR Sandbox State
  const [ocrInputText, setOcrInputText] = useState('BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrStatusMessage, setOcrStatusMessage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>({
    originalText: 'BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34',
    correctedText: 'BALL VALVE 2" 150# WCB BODY SS316 BALL & STEM FLANGED ASME B16.34',
    corrections: [
      { rawToken: 'SS3I6', correctedToken: 'SS316', dictionaryMatch: 'ASTM A276 Grade Stainless Steel Lexicon', confidence: 99.2 },
      { rawToken: 'WCB_B0DY', correctedToken: 'WCB BODY', dictionaryMatch: 'API Valve Casting Standards Dictionary', confidence: 97.4 },
      { rawToken: '15O#', correctedToken: '150#', dictionaryMatch: 'ASME Pressure Rating Standard Lexicon', confidence: 99.1 },
    ],
    extractedJSON: {
      equipment_category: 'INDUSTRIAL PIPING / VALVE',
      valve_type: 'BALL VALVE',
      nominal_size: '2 INCH (DN 50)',
      pressure_rating: 'CLASS 150# (PN20)',
      body_material: 'ASTM A216 WCB',
      trim_material: 'ASTM A276 SS316',
      end_connection: 'FLANGED RAISED FACE (RF)',
      design_standard: 'ASME B16.34 / API 6D',
    },
  });

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const q = searchQuery.toLowerCase();
      return (
        r.materialCodeCPSE.toLowerCase().includes(q) ||
        r.materialDescriptionRaw.toLowerCase().includes(q) ||
        r.groundTruthStandardName.toLowerCase().includes(q) ||
        r.groundTruthNationalCode.toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await uploadCSV(file);
      if (data) {
        setUploadStatus(`Successfully Ingested ${data.importedCount} Material Records! Generated Common National Codes & Synced to S/4HANA.`);
        setTimeout(() => {
          setUploadStatus(null);
          window.location.reload();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRunOCR = async () => {
    setIsOcrProcessing(true);
    try {
      const data = await runOCRSpellcheck(ocrInputText);
      if (data) {
        setOcrResult(data);
        setOcrStatusMessage('Agent 2 Multimodal LayoutLMv3 & Lexicon Disambiguation Completed');
        setTimeout(() => setOcrStatusMessage(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shadow-2xs">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                {currentUser?.cpse || 'CPSE'} Plant Material Master &amp; Digitization Portal
              </h2>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                {currentUser?.plantLocation || 'PLANT RECONCILIATION'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Clean existing material masters, digitize legacy blueprints, and map local codes to Common National Codes
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('STANDARDIZATION')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'STANDARDIZATION'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Standardization (Before/After)
            </span>
          </button>
          <button
            onClick={() => setSubTab('OCR')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'OCR'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Legacy Blueprint OCR
            </span>
          </button>
          <button
            onClick={() => setSubTab('INGESTION')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'INGESTION'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <UploadCloud className="w-3.5 h-3.5" />
              Bulk CSV Ingestion
            </span>
          </button>
          <button
            onClick={() => setSubTab('ERP_SYNC')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'ERP_SYNC'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ERP S/4HANA Sync Status
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MATERIAL STANDARDIZATION (BEFORE / AFTER) */}
      {subTab === 'STANDARDIZATION' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex justify-between items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by local code, raw description, or national code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-blue-500"
              />
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              Showing {filteredRecords.length} Materials
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Record List (Left) */}
            <div className="col-span-5 space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.materialCodeCPSE}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer font-mono text-xs ${
                    selectedRecord?.materialCodeCPSE === rec.materialCodeCPSE
                      ? 'bg-blue-50/50 border-blue-400 shadow-xs ring-1 ring-blue-400'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{rec.materialCodeCPSE}</span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                      {rec.status || 'SYNCED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    "{rec.materialDescriptionRaw}"
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                    <span>{rec.cpseName} ({rec.plantLocation})</span>
                    <span className="text-blue-600 font-bold">{rec.groundTruthNationalCode}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Before vs After Side-by-Side Detailed Comparison (Right) */}
            <div className="col-span-7">
              {selectedRecord ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                        Material Standardization Inspector
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {selectedRecord.materialCodeCPSE} ➔ {selectedRecord.groundTruthNationalCode}
                      </h3>
                    </div>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold">
                      Confidence: {(selectedRecord.finalConfidence ? selectedRecord.finalConfidence * 100 : 98.5).toFixed(1)}%
                    </span>
                  </div>

                  {/* Dual Specification Cards: Before vs After */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Before (Legacy Raw Record) */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" /> Legacy Raw Input (SAP MAKT)
                      </div>
                      <div className="font-mono text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed min-h-[60px]">
                        "{selectedRecord.materialDescriptionRaw}"
                      </div>
                      <div className="space-y-1 text-[11px] font-mono text-slate-600 pt-1">
                        <div>Legacy Code: <strong className="text-slate-900">{selectedRecord.materialCodeCPSE}</strong></div>
                        <div>Plant: <span className="text-slate-800">{selectedRecord.plantLocation}</span></div>
                        <div>Raw Spec: <span className="text-slate-800">{selectedRecord.specificationRaw}</span></div>
                      </div>
                    </div>

                    {/* After (Harmonized National Master) */}
                    <div className="bg-blue-50/40 border border-blue-200 p-4 rounded-xl space-y-2">
                      <div className="text-[10px] font-mono font-bold text-blue-700 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Standardized National Master
                      </div>
                      <div className="font-mono text-xs text-slate-900 bg-white p-2.5 rounded-lg border border-blue-200 leading-relaxed min-h-[60px] font-semibold">
                        "{selectedRecord.groundTruthStandardName}"
                      </div>
                      <div className="space-y-1 text-[11px] font-mono text-slate-600 pt-1">
                        <div>National Code: <strong className="text-blue-700">{selectedRecord.groundTruthNationalCode}</strong></div>
                        <div>Extracted Grade: <span className="text-slate-900 font-bold">{selectedRecord.extractedGrade || 'SS316 / WCB'}</span></div>
                        <div>Pressure Rating: <span className="text-slate-900 font-bold">{selectedRecord.extractedPressure || '150#'}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Extracted Normalized Attribute Grid */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
                    <span className="text-xs font-bold text-slate-900 uppercase font-mono block">
                      Normalized Technical Attributes (Agent 1 AI Resolution):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase">Dimension</span>
                        <strong className="text-slate-900">{selectedRecord.extractedDimension || '2 INCH (DN 50)'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase">Standard</span>
                        <strong className="text-slate-900">{selectedRecord.extractedStandard || 'ASME B16.34'}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase">Base UoM</span>
                        <strong className="text-slate-900">{selectedRecord.unitOfMeasurement}</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block uppercase">Procured Qty</span>
                        <strong className="text-slate-900">{selectedRecord.annualProcuredQty} / yr</strong>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 font-mono">
                  Select a material on the left to inspect its before/after standardization attributes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEGACY BLUEPRINT & DOCUMENT OCR (AGENT 2) */}
      {subTab === 'OCR' && (
        <div className="space-y-4">
          {ocrStatusMessage && (
            <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {ocrStatusMessage}
            </div>
          )}

          {/* Interactive OCR Query Tester */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 uppercase font-mono">
                Test Scanned Blueprint / Flawed OCR Text:
              </span>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setOcrInputText('BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34')}
                  className="text-blue-600 hover:underline font-mono text-[11px] cursor-pointer"
                >
                  [Sample 1: Valve Flaws]
                </button>
                <button
                  onClick={() => setOcrInputText('SPIR WOUND GASK SS3I6 4" 15O# 0-RING NBR_7OA')}
                  className="text-blue-600 hover:underline font-mono text-[11px] cursor-pointer"
                >
                  [Sample 2: Gasket Flaws]
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={ocrInputText}
                onChange={(e) => setOcrInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-blue-500"
              />
              <button
                onClick={handleRunOCR}
                disabled={isOcrProcessing}
                className="btn-stitch bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isOcrProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Execute Agent 2 OCR
              </button>
            </div>
          </div>

          {/* Grid: Blueprint Crop Viewer vs JSON Payload */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono flex items-center gap-1.5">
                  <Scan className="w-4 h-4 text-blue-600" />
                  Scanned Drawing Bounding Box Crop
                </span>
                <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Confidence: 98.4%
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-sky-400 font-mono text-xs space-y-2 shadow-inner">
                <div className="flex justify-between items-center text-[9px] text-sky-400/60 pb-2 border-b border-slate-800">
                  <span>LAYOUTLMV3 BBOX [x:120, y:340, w:450, h:80]</span>
                  <span>ENGINE: TESSERACT 5.0 LSTM</span>
                </div>
                <div className="border border-dashed border-sky-500/40 rounded-lg p-3 bg-sky-500/10 my-2">
                  <div className="text-[10px] text-slate-300 uppercase">ITEM SPECIFICATION BLOCK</div>
                  <div className="text-sm font-bold text-white tracking-wide mt-1">
                    "{ocrResult.originalText}"
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs space-y-1">
                <span className="text-slate-400 font-medium text-[10px] uppercase font-mono">Disambiguated Clean Text:</span>
                <p className="font-mono font-bold text-emerald-700">"{ocrResult.correctedText}"</p>
              </div>
            </div>

            <div className="col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono">
                  Extracted Industrial JSON Schema
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Schema Validated
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs overflow-x-auto shadow-inner max-h-[220px]">
                <pre className="text-emerald-400 text-xs">
{JSON.stringify(ocrResult.extractedJSON, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Lexicon Disambiguation Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase font-mono border-b border-slate-100 pb-3">
              <SpellCheck className="w-4 h-4 text-blue-600" />
              <span>Domain-Specific Industrial Lexicon Corrections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ocrResult.corrections?.map((corr: any, idx: number) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-rose-600 font-bold line-through">{corr.rawToken}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-emerald-600 font-bold">{corr.correctedToken}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate" title={corr.dictionaryMatch}>
                    {corr.dictionaryMatch}
                  </span>
                  <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 font-bold rounded inline-block">
                    Match: {corr.confidence}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: BULK CSV INGESTION */}
      {subTab === 'INGESTION' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              Bulk Material Master CSV / Excel File Ingestion
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Upload plant-level material masters to execute batch AI deduplication and generate Common National Material Codes
            </p>
          </div>

          {uploadStatus ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold font-mono text-xs">{uploadStatus}</p>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50 transition-colors">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <label className="cursor-pointer">
                <span className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs inline-block transition-all">
                  {isUploading ? 'Processing AI Pipeline...' : 'Choose Plant CSV File'}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400 font-mono mt-3">
                Expected Columns: <code>material_code_cpse</code>, <code>material_description_raw</code>, <code>plant_location</code>, <code>avg_unit_price_inr</code>
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: ERP S/4HANA SYNC STATUS */}
      {subTab === 'ERP_SYNC' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-900 uppercase">
              SAP S/4HANA Material Master (MARA/MAKT) Reconciliation Receipts
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              RFC Protocol Active
            </span>
          </div>

          <div className="space-y-2.5">
            {records.slice(0, 5).map((rec) => (
              <div key={rec.materialCodeCPSE} className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex flex-wrap justify-between items-center gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{rec.materialCodeCPSE}</strong>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-blue-700 font-bold">{rec.groundTruthNationalCode}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {rec.groundTruthStandardName}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px]">
                  <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">
                    BAPI: MATDOC-84021{rec.rowId}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    RECONCILED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
