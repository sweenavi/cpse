import { useState, useRef } from 'react';
import type { UserProfile } from '../types';
import { 
  FileText, CheckCircle2, AlertTriangle, Play, RefreshCw, UploadCloud, 
  Image as ImageIcon, X, FileUp, Zap, Clock, Search, Filter, MoreHorizontal, 
  Database, AlertCircle, ExternalLink, ArrowRight, Table, ScanLine, ArrowUpRight, ShieldCheck, History,
  FileDigit, Scan, SpellCheck, ArrowLeft, Send
} from 'lucide-react';
import { uploadOCRImage } from '../services/api';

interface LegacyOCRInspectorProps {
  currentUser?: UserProfile | null;
  onNavigateTab?: (tabId: any) => void;
}

// Mock Data for Recent Uploads Table
const RECENT_UPLOADS = [
  { id: '1', name: 'IOCL_MM_Scanned_001.pdf', type: 'PDF (Scanned)', pages: 45, records: 182, status: 'Processing', date: '28 Aug 2025, 10:30 AM' },
  { id: '2', name: 'IOCL_Old_MM_Inventory.xlsx', type: 'Excel', pages: 3, records: 320, status: 'Extraction Completed', date: '28 Aug 2025, 10:20 AM' },
  { id: '3', name: 'IOCL_Catalogue_Page12.jpg', type: 'JPG', pages: 1, records: 28, status: 'Needs Validation', date: '28 Aug 2025, 10:05 AM' },
  { id: '4', name: 'Handwritten_List_1998.png', type: 'PNG (Handwritten)', pages: 2, records: 16, status: 'Low Confidence', date: '28 Aug 2025, 09:50 AM' },
  { id: '5', name: 'IOCL_Technical_Specs.pdf', type: 'PDF', pages: 12, records: 96, status: 'Extraction Completed', date: '28 Aug 2025, 09:40 AM' },
  { id: '6', name: 'Corrupted_File.pdf', type: 'PDF', pages: '-', records: 0, status: 'Failed', date: '28 Aug 2025, 09:30 AM' }
];

const EXTRACTED_RECORDS = [
  { id: 'EX-9921', desc: 'BALL VALVE 2" 150# WCB BODY SS316', source: 'IOCL_Catalogue_Page12.jpg', confidence: 94, status: 'Needs Validation' },
  { id: 'EX-9922', desc: 'SEAMLESS PIPE CS ASTM A106 GR B', source: 'IOCL_Catalogue_Page12.jpg', confidence: 99, status: 'Validated' },
  { id: 'EX-9923', desc: 'GATE VALVE 4" 300# FLANGED', source: 'IOCL_MM_Scanned_001.pdf', confidence: 82, status: 'Low Confidence' },
  { id: 'EX-9924', desc: 'CHECK VALVE 6" 150# WCB', source: 'IOCL_MM_Scanned_001.pdf', confidence: 97, status: 'Validated' },
  { id: 'EX-9925', desc: 'FLANGE WELD NECK 8" 150# RF', source: 'IOCL_Old_MM_Inventory.xlsx', confidence: 100, status: 'Validated' },
];

export function LegacyOCRInspectorView({ currentUser, onNavigateTab }: LegacyOCRInspectorProps) {
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'EXTRACTED_RECORDS'>('DASHBOARD');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Modal states
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [selectedRecordForEvidence, setSelectedRecordForEvidence] = useState<any>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImagePreviewUrl(null);
    }
  };

  const handleImageOCR = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setStatusMessage('Uploading legacy document to OCR Engine...');
    try {
      const data = await uploadOCRImage(selectedFile);
      if (data) {
        setStatusMessage(`Extraction Complete: Found ${data.correctedText?.split(' ').length || 0} technical tokens`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err: any) {
      setStatusMessage(`OCR Error: ${err.message || 'Unknown error'}`);
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Processing': return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1 w-max"><RefreshCw className="w-3 h-3 animate-spin"/> Processing</span>;
      case 'Extraction Completed': 
      case 'Validated': return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> {status}</span>;
      case 'Needs Validation': return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1 w-max"><AlertTriangle className="w-3 h-3"/> Needs Validation</span>;
      case 'Low Confidence': return <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold flex items-center gap-1 w-max"><AlertCircle className="w-3 h-3"/> Low Confidence</span>;
      case 'Failed': return <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1 w-max"><X className="w-3 h-3"/> Failed</span>;
      default: return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 w-max">{status}</span>;
    }
  };

  const openEvidenceModal = (record: any) => {
    setSelectedRecordForEvidence(record);
    setShowEvidenceModal(true);
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              OCR Legacy Inspector <InfoIcon />
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload legacy documents, extract material data using OCR / parsing, validate and route for review.
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-xs transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> View Documentation
        </button>
      </div>

      {statusMessage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl shadow-xs text-center font-mono text-xs font-bold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          {statusMessage}
        </div>
      )}

      {viewMode === 'DASHBOARD' ? (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer hover:shadow-md transition-shadow"><KPICard icon={<FileText className="w-4 h-4 text-blue-600" />} label="Total Documents" value="1,248" sub="All time" color="blue" /></div>
            <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer hover:shadow-md transition-shadow"><KPICard icon={<FileUp className="w-4 h-4 text-emerald-600" />} label="Uploaded Today" value="156" sub="↑ 12% vs yesterday" color="emerald" subColor="text-emerald-600" /></div>
            <KPICard icon={<RefreshCw className="w-4 h-4 text-purple-600" />} label="Processing" value="32" sub="In progress" color="purple" />
            <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer hover:shadow-md transition-shadow"><KPICard icon={<Scan className="w-4 h-4 text-indigo-600" />} label="Extraction Completed" value="1,108" sub="Success" color="indigo" /></div>
            <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer hover:shadow-md transition-shadow"><KPICard icon={<AlertTriangle className="w-4 h-4 text-amber-600" />} label="Needs Validation" value="214" sub="Low/Medium Confidence" color="amber" /></div>
            <KPICard icon={<X className="w-4 h-4 text-rose-600" />} label="Failed" value="18" sub="Action Required" color="rose" subColor="text-rose-600" />
            <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer hover:shadow-md transition-shadow"><KPICard icon={<Database className="w-4 h-4 text-teal-600" />} label="Records Created" value="9,842" sub="All time" color="teal" /></div>
            <KPICard icon={<ArrowRight className="w-4 h-4 text-fuchsia-600" />} label="Sent to Review" value="3,421" sub="This Month" color="fuchsia" />
          </div>

          {/* MIDDLE ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Upload Workspace */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2 mb-4">Upload Legacy Data</h3>
              
              <div 
                className="flex-1 border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer relative"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx" onChange={handleFileSelect} />
                
                {!selectedFile ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-slate-800 mb-1">Drag & drop files here or <span className="text-blue-600 hover:underline">click to browse</span></h4>
                    <p className="text-xs text-slate-500 mb-3">PNG, JPG, JPEG, PDF, XLS, XLSX supported</p>
                    <div className="bg-blue-100/50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-full mb-6">
                      Handwritten & Scanned documents supported
                    </div>
                    
                    <div className="flex items-center gap-3 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
                        <FileUp className="w-4 h-4"/> Browse Files
                      </button>
                      <button className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2">
                        <Table className="w-4 h-4 text-emerald-600"/> Import from Excel
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-4 flex items-center gap-3">
                      <span>Maximum file size: 100 MB</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span>Max files per upload: 20</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex flex-col h-full bg-white border border-slate-200 rounded-lg p-4 shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
                          <FileText className="w-5 h-5"/>
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{selectedFile.name}</h4>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span className="uppercase">{selectedFile.name.split('.').pop()}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={clearFile} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                    
                    <div className="mt-auto space-y-2">
                      <button 
                        onClick={handleImageOCR} 
                        disabled={isProcessing}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {isProcessing ? <><RefreshCw className="w-4 h-4 animate-spin"/> Processing OCR...</> : <><Play className="w-4 h-4"/> Start Ingestion Pipeline</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Processing Pipeline */}
            <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">OCR Processing Pipeline</h3>
              <div className="flex-1 space-y-0 text-xs">
                <PipelineStep num={1} label="File Validation" status="success" />
                <PipelineStep num={2} label="Image Preprocessing" status="success" />
                <PipelineStep num={3} label="OCR / Parsing" status="active" />
                <PipelineStep num={4} label="Layout & Table Detection" status="pending" />
                <PipelineStep num={5} label="Field Extraction" status="pending" />
                <PipelineStep num={6} label="Normalization" status="pending" />
                <PipelineStep num={7} label="Data Quality Validation" status="pending" />
                <PipelineStep num={8} label="Confidence Scoring" status="pending" />
                <PipelineStep num={9} label="Human Validation" status="pending" />
                <PipelineStep num={10} label="Staging & Routing" status="pending" isLast />
              </div>
            </div>

            {/* Recent Batch */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800">Recent Batch</h3>
                <button className="text-[10px] font-bold text-blue-600 hover:underline">View All Batches</button>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-bold text-slate-800">Batch ID: <span className="font-mono">LM-2025-0184</span></div>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">Processing</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div>
                      <div className="text-slate-500 mb-0.5">Uploaded by</div>
                      <div className="font-bold text-slate-800">Ravi Kumar</div>
                    </div>
                    <div>
                      <div className="text-slate-500 mb-0.5">CPSE</div>
                      <div className="font-bold text-slate-800">IOCL</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-slate-500 mb-0.5">Uploaded on</div>
                      <div className="font-bold text-slate-800">28 Aug 2025, 10:30 AM</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center border-t border-slate-100 pt-4">
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Files</div>
                      <div className="text-lg font-bold text-slate-800">24</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Pages / Sheets</div>
                      <div className="text-lg font-bold text-slate-800">312</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Records Detected</div>
                      <div className="text-lg font-bold text-slate-800">1,248</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 mb-1">Extracted</div>
                      <div className="text-lg font-bold text-slate-800">842</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-[10px] font-bold mb-1.5">
                    <span className="text-slate-600">Overall Progress</span>
                    <span className="text-blue-700">68%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Recent Uploads Table */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 border-l-4 border-blue-600 pl-2">Recent Uploads</h3>
                <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
                      <th className="p-3 font-bold">File Name</th>
                      <th className="p-3 font-bold">Type</th>
                      <th className="p-3 font-bold text-center">Pages / Sheets</th>
                      <th className="p-3 font-bold text-center">Records Detected</th>
                      <th className="p-3 font-bold">Status</th>
                      <th className="p-3 font-bold">Uploaded On</th>
                      <th className="p-3 font-bold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {RECENT_UPLOADS.map((file) => (
                      <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {file.name.includes('.pdf') ? <FileText className="w-4 h-4 text-rose-500" /> : 
                             file.name.includes('.xls') ? <Table className="w-4 h-4 text-emerald-500" /> : 
                             <ImageIcon className="w-4 h-4 text-blue-500" />}
                            <span className="font-medium text-slate-800">{file.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{file.type}</td>
                        <td className="p-3 text-center text-slate-600">{file.pages}</td>
                        <td className="p-3 text-center text-slate-800 font-semibold">{file.records}</td>
                        <td className="p-3">{renderStatusBadge(file.status)}</td>
                        <td className="p-3 text-slate-500">{file.date}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => openEvidenceModal(file)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                            title="View Extraction Evidence"
                          >
                            <MoreHorizontal className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 border-t border-slate-200 text-center">
                <button className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto">
                  View All Uploads <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Quick Actions & Summaries */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              
              {/* Quick Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div onClick={() => setViewMode('EXTRACTED_RECORDS')} className="cursor-pointer">
                    <QuickActionButton icon={<AlertTriangle className="w-4 h-4 text-amber-600"/>} title="Low Confidence Queue" sub="214 Records" color="amber" />
                  </div>
                  <div 
                    onClick={() => setViewMode('EXTRACTED_RECORDS')}
                    className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-3 cursor-pointer transition-colors flex flex-col justify-center h-full group"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <Database className="w-4 h-4 text-blue-700 mt-0.5" />
                      <span className="text-xs font-bold text-blue-900 leading-tight group-hover:underline">View Recently Added Data</span>
                    </div>
                    <span className="text-[10px] text-blue-700 ml-6">842 Records</span>
                  </div>
                  <QuickActionButton icon={<ArrowUpRight className="w-4 h-4 text-emerald-600"/>} title="Send to Reviewer Portal" sub="56 Records Ready" color="emerald" />
                  <QuickActionButton icon={<RefreshCw className="w-4 h-4 text-rose-600"/>} title="Reprocess Failed Files" sub="18 Files" color="rose" />
                  <QuickActionButton icon={<LayersIcon className="w-4 h-4 text-indigo-600"/>} title="View Batches" sub="All Ingestion Batches" color="indigo" />
                  <QuickActionButton icon={<History className="w-4 h-4 text-purple-600"/>} title="Audit Trail" sub="View All Activities" color="purple" />
                </div>
              </div>

              {/* Supported File Types */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Supported File Types</h3>
                <div className="flex gap-4 mb-3 justify-between">
                  <TypeBadge icon={<ImageIcon className="w-4 h-4 text-blue-600"/>} title="PNG" sub="Images" bg="bg-blue-50" />
                  <TypeBadge icon={<ImageIcon className="w-4 h-4 text-purple-600"/>} title="JPG / JPEG" sub="Images" bg="bg-purple-50" />
                  <TypeBadge icon={<FileText className="w-4 h-4 text-rose-600"/>} title="PDF" sub="Documents" bg="bg-rose-50" />
                  <TypeBadge icon={<Table className="w-4 h-4 text-emerald-600"/>} title="XLS / XLSX" sub="Spreadsheets" bg="bg-emerald-50" />
                </div>
                <p className="text-[10px] text-slate-500 mb-2">Handwritten documents, scanned documents, multi-page PDFs and spreadsheets are supported.</p>
                <button className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">View Supported Formats <ArrowRight className="w-3 h-3"/></button>
              </div>

            </div>
          </div>
          
          {/* Extraction Quality Summary (Bottom Full Width) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-600" /> Extraction Quality Summary <span className="text-[10px] font-normal text-slate-500">(This Month)</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-x divide-slate-100">
              <QualityMetric title="Avg. OCR Accuracy" value="92%" sub="↑ 5% vs last month" subColor="text-emerald-600" />
              <QualityMetric title="High Confidence Records" value="6,542" sub="66%" />
              <QualityMetric title="Medium Confidence Records" value="2,346" sub="24%" />
              <QualityMetric title="Low Confidence Records" value="954" sub="10%" />
              <div className="pl-6 flex flex-col justify-between">
                <div className="mb-2">
                  <div className="text-[10px] text-slate-500 mb-0.5 font-bold">Validation Completion</div>
                  <div className="text-lg font-bold text-slate-900">87%</div>
                  <div className="text-[10px] text-emerald-600 font-bold">↑ 8% vs last month</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5 font-bold">Duplicate Detection Rate</div>
                  <div className="text-lg font-bold text-slate-900">12%</div>
                  <div className="text-[10px] text-emerald-600 font-bold">↓ 3% vs last month</div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* EXTRACTED RECORDS DATA TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('DASHBOARD')}
                className="p-1.5 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" /> Extracted Material Records
                </h3>
                <p className="text-[10px] text-slate-500">Showing recently added records pending validation or review routing.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" />
                <input type="text" placeholder="Search extracted descriptions..." className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-blue-500 w-64" />
              </div>
              <button className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50">
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-[10px] uppercase text-slate-600 border-b border-slate-200">
                  <th className="p-3 font-bold w-12 text-center"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="p-3 font-bold">Record ID</th>
                  <th className="p-3 font-bold w-1/3">Extracted Description</th>
                  <th className="p-3 font-bold">Source File</th>
                  <th className="p-3 font-bold text-center">Avg. Confidence</th>
                  <th className="p-3 font-bold">Validation Status</th>
                  <th className="p-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {EXTRACTED_RECORDS.map((rec) => (
                  <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-center"><input type="checkbox" className="rounded border-slate-300" /></td>
                    <td className="p-3 font-mono font-bold text-slate-700">{rec.id}</td>
                    <td className="p-3 font-bold text-blue-900">{rec.desc}</td>
                    <td className="p-3 text-slate-600 text-[10px] truncate max-w-[200px]" title={rec.source}>{rec.source}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-bold ${rec.confidence > 90 ? 'text-emerald-600' : rec.confidence > 80 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {rec.confidence}%
                        </span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          <div className={`h-full ${rec.confidence > 90 ? 'bg-emerald-500' : rec.confidence > 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${rec.confidence}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">{renderStatusBadge(rec.status)}</td>
                    <td className="p-3">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={() => openEvidenceModal(rec)}
                          className="px-2 py-1 bg-white border border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-300 rounded text-[10px] font-bold transition-colors"
                          title="View Source Evidence"
                        >
                          View Source
                        </button>
                        <button 
                          className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                          title="Route to Reviewer Portal (Requires Analyst Role)"
                        >
                          <Send className="w-3 h-3" /> Review
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
      
      {/* Enhanced Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Scan className="w-5 h-5 text-blue-600" /> Source Evidence & Field Validation
                </h2>
                <p className="text-xs text-slate-500">Record: <strong className="font-mono">{selectedRecordForEvidence?.id || 'EX-9921'}</strong> • Source: {selectedRecordForEvidence?.source || 'IOCL_Catalogue_Page12.jpg'}</p>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left side: Source Document Crop */}
              <div className="w-full md:w-1/2 p-4 bg-slate-100 border-r border-slate-200 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">Source Document Crop</h3>
                  <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">Page 1 • Region: [x:120, y:340]</span>
                </div>
                <div className="flex-1 bg-slate-900 rounded-xl p-4 text-sky-400 font-mono text-xs relative overflow-hidden shadow-inner flex flex-col justify-center items-center">
                  <div className="border border-dashed border-sky-500/60 rounded-lg p-5 bg-sky-500/10 w-full max-w-sm">
                    <div className="text-[10px] text-slate-300 uppercase mb-2">RAW OCR EXTRACTION</div>
                    <div className="text-lg font-bold text-white tracking-wide">
                      BALL VALVE 2" 15O# WCB_B0DY SS3I6 BALL & STEM FLANGED ASME B16.34
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-6 text-center max-w-xs">
                    * Interactive bounding box mapped directly from LayoutLMv3 spatial coordinates.
                  </div>
                </div>
              </div>
              
              {/* Right side: Field-Level Validation Form */}
              <div className="w-full md:w-1/2 p-4 bg-white overflow-y-auto">
                <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase">Field-Level Validation & Normalization</h3>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Dictionary Assisted</span>
                </div>
                
                <div className="space-y-4">
                  <ValidationField label="Equipment Category" ocrValue="VALVE" conf={98} />
                  <ValidationField label="Valve Type" ocrValue="BALL VALVE" conf={99} />
                  <ValidationField label="Nominal Size" ocrValue='2"' normalizedValue='2" NB' conf={92} isCorrected />
                  <ValidationField label="Pressure Rating" ocrValue="15O#" normalizedValue="150#" conf={74} isCorrected hasWarning />
                  <ValidationField label="Body Material" ocrValue="WCB_B0DY" normalizedValue="ASTM A216 WCB" conf={68} isCorrected hasWarning />
                  <ValidationField label="Trim Material" ocrValue="SS3I6" normalizedValue="ASTM A276 SS316" conf={72} isCorrected hasWarning />
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 text-[10px] flex gap-2 text-blue-800">
                    <InfoIcon />
                    <div>
                      <strong>Normalization Note:</strong> The industrial dictionary engine automatically corrected common OCR typos (O vs 0, I vs 1). 
                      Authorized Data Analysts can override these values if the physical source crop indicates a different specification.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
              <div className="text-[10px] text-slate-500">
                Audit Trail: <span className="font-mono">Log ID #9921-A</span> • Last modified by System Pipeline.
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-50">Mark as Unreadable</button>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Save Validated Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ---------------- Helper Components ----------------

function ValidationField({ label, ocrValue, normalizedValue, conf, isCorrected, hasWarning }: any) {
  return (
    <div className={`p-3 rounded-lg border ${hasWarning ? 'bg-amber-50/30 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex justify-between items-end mb-2">
        <label className="text-[10px] font-bold text-slate-700 uppercase">{label}</label>
        <div className="flex items-center gap-1.5" title={`Confidence: ${conf}%`}>
          <span className={`text-[10px] font-bold ${conf > 90 ? 'text-emerald-600' : conf > 70 ? 'text-amber-600' : 'text-rose-600'}`}>
            {conf}%
          </span>
          <div className="w-8 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full ${conf > 90 ? 'bg-emerald-500' : conf > 70 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${conf}%` }}></div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[9px] text-slate-400 mb-0.5">Raw OCR Extraction</div>
          <div className={`font-mono text-xs p-1.5 rounded bg-white border ${isCorrected ? 'border-rose-200 text-rose-700 line-through' : 'border-slate-200 text-slate-700'}`}>
            {ocrValue}
          </div>
        </div>
        {isCorrected && (
          <>
            <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-3" />
            <div className="flex-1">
              <div className="text-[9px] text-slate-400 mb-0.5">Normalized Value</div>
              <input 
                type="text" 
                defaultValue={normalizedValue || ocrValue} 
                className="w-full font-mono font-bold text-xs p-1.5 rounded bg-white border border-emerald-300 text-emerald-800 focus:outline-emerald-500"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ... [rest of the helper components remain exactly the same as previously built] ...
function InfoIcon() {
  return (
    <svg className="w-4 h-4 text-blue-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LayersIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function KPICard({ icon, label, value, sub, color, subColor }: any) {
  const bgColors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    fuchsia: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
  };
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col justify-between h-full">
      <div className={`w-7 h-7 rounded flex items-center justify-center border ${bgColors[color as keyof typeof bgColors]} mb-3`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-bold text-slate-500 mb-0.5 truncate" title={label}>{label}</div>
        <div className="text-xl font-bold text-slate-900 leading-tight">{value}</div>
        <div className={`text-[9px] font-bold mt-1 ${subColor || 'text-slate-400'}`}>{sub}</div>
      </div>
    </div>
  );
}

function PipelineStep({ num, label, status, isLast }: { num: number, label: string, status: 'success' | 'active' | 'pending', isLast?: boolean }) {
  return (
    <div className="flex items-start gap-3 relative pb-3">
      {!isLast && <div className={`absolute top-5 left-2.5 w-px h-full -z-10 ${status === 'success' ? 'bg-emerald-200' : 'bg-slate-200'}`}></div>}
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold z-10 border-2 bg-white
        ${status === 'success' ? 'border-emerald-500 text-emerald-600' : 
          status === 'active' ? 'border-blue-600 text-blue-600' : 
          'border-slate-300 text-slate-400'}`
      }>
        {status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : num}
      </div>
      <div className={`flex-1 ${status === 'success' ? 'text-slate-700' : status === 'active' ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
        {label}
      </div>
      {status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
      {status === 'active' && <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />}
    </div>
  );
}

function QuickActionButton({ icon, title, sub, color }: any) {
  const bgColors = {
    amber: 'bg-amber-50 hover:bg-amber-100 border-amber-200',
    emerald: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200',
    rose: 'bg-rose-50 hover:bg-rose-100 border-rose-200',
    indigo: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200',
    purple: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
  };
  return (
    <div className={`${bgColors[color as keyof typeof bgColors]} border rounded-lg p-3 cursor-pointer transition-colors flex flex-col justify-center h-full group`}>
      <div className="flex items-start gap-2 mb-1">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <span className="text-xs font-bold text-slate-800 leading-tight group-hover:underline">{title}</span>
      </div>
      <span className="text-[10px] text-slate-500 ml-6">{sub}</span>
    </div>
  );
}

function TypeBadge({ icon, title, sub, bg }: any) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-1 p-2">
      <div className={`${bg} w-8 h-8 rounded flex items-center justify-center mb-1`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold text-slate-800">{title}</div>
      <div className="text-[9px] text-slate-500">{sub}</div>
    </div>
  );
}

function QualityMetric({ title, value, sub, subColor }: any) {
  return (
    <div className="pl-6 first:pl-0">
      <div className="text-[10px] text-slate-500 mb-1 font-bold">{title}</div>
      <div className="text-2xl font-bold text-slate-900 leading-none mb-1">{value}</div>
      <div className={`text-[10px] font-bold ${subColor || 'text-slate-400'}`}>{sub}</div>
    </div>
  );
}
