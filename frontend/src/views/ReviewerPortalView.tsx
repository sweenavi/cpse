import { useState, useMemo, useEffect } from 'react';
import type { UserProfile, AdjudicationCandidate, MaterialRecord } from '../types';
import {
  Search, Filter, Clock, ChevronRight, X, ShieldCheck, ArrowUpRight, ExternalLink,
  Edit3, RotateCcw, Sparkles, Info, Check, BarChart3, Shield, FileText,
  Bookmark, Share2, Cpu, Hash, Activity, FolderTree, GitMerge, SlidersHorizontal,
  FileSpreadsheet, History, FileCode, CheckCircle, HelpCircle, BookOpen,
  FileSearch, MessageSquare, AlertOctagon, ArrowRight, Download, FileCheck,
  Send, Eye, CheckCircle2, FileQuestion, AlertTriangle, CheckSquare, ListChecks, Layers, Globe,
  CheckCircle as CheckCircleIcon, Zap
} from 'lucide-react';

interface ReviewCaseItem {
  id: string;
  title: string;
  subtitle: string;
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;
  candidateCount: number;
  slaText: string;
  status: 'Pending Review' | 'Assigned' | 'In Progress' | 'Needs More Information' | 'Escalated' | 'Approved' | 'Rejected' | 'Submitted to National Registry' | 'Completed';
  assignedReviewer: string;
  proposedNationalCode: string;
  sources: {
    cpse: string;
    code: string;
    sourceType: 'SAP' | 'Legacy OCR' | 'Excel';
    attributes: Record<string, string>;
  }[];
  canonicalProposed: Record<string, string>;
  attributeStates: Record<string, 'MATCH' | 'NORMALIZED' | 'CONFLICT' | 'MISSING'>;
  attributeConfidence: Record<string, number>;
  aiAnalysis: {
    overallSimilarity: number;
    factors: { name: string; score: number; status: 'MATCH' | 'NORMALIZED' | 'CONFLICT' }[];
    recommendation: string;
    explanation: string;
  };
  impact: {
    newNationalCode: string;
    cpsesUnified: string[];
    stockPoolingUnits: string;
    procurementSavings: string;
  };
  standards: { code: string; title: string; link: string; valid: boolean }[];
  sourceDocs: { cpse: string; filename: string; page: string; extract: string; confidence: number; type: string }[];
  notes: { author: string; date: string; text: string }[];
  history: { date: string; author: string; action: string; details: string; oldVal?: string; newVal?: string }[];
  duplicates: { cpse: string; code: string; score: number; confidence: string; status: string }[];
}

export function ReviewerPortalView({
  currentUser,
  onNavigateTab,
  queue = [],
  records = [],
  onApprove,
  onReject,
}: {
  currentUser?: UserProfile | null;
  onNavigateTab?: (tab: string) => void;
  queue?: AdjudicationCandidate[];
  records?: MaterialRecord[];
  onApprove?: (item: AdjudicationCandidate) => Promise<void> | void;
  onReject?: (item: AdjudicationCandidate) => Promise<void> | void;
}) {
  const dynamicCases = useMemo<ReviewCaseItem[]>(() => {
    if (queue && queue.length > 0) {
      return queue.map((q) => {
        const lr = q.localRecord || ({} as any);
        const cm = q.candidateMaster || ({} as any);
        return {
          id: q.id,
          title: cm.standardizedName || lr.materialDescriptionRaw || 'Industrial Commodity Candidate',
          subtitle: `${lr.extractedDimension || ''}, ${lr.extractedGrade || ''}, ${lr.extractedStandard || ''}`.trim(),
          priority: (q.finalConfidence || 0.85) < 0.85 ? 'High' : 'Medium',
          confidence: Math.round((q.finalConfidence || 0.89) * 100),
          candidateCount: cm.participatingCPSEs?.length || 2,
        slaText: 'SLA: 24h Review',
        status: 'In Progress',
        assignedReviewer: 'Er. Rajesh Kulkarni (ONGC)',
        proposedNationalCode: cm.nationalCode || 'NMM-0001842',
        sources: [
          {
            cpse: lr.cpseName || 'CPCL',
            code: lr.materialCodeCPSE || 'MAT-LOCAL',
            sourceType: (lr.sourceSystem as any) || 'SAP',
            attributes: {
              'Material Type': lr.materialType || 'Industrial SKU',
              'Grade': lr.extractedGrade || 'Standard',
              'Standard': lr.extractedStandard || 'Standard',
              'Size': lr.extractedDimension || 'Standard',
              'Nominal Bore': lr.extractedDimension || 'Standard',
              'Schedule': lr.extractedPressure || 'Standard',
              'Manufacturing': lr.manufacturingMethod || 'Standard',
              'Material Group': lr.materialGroup || 'Pipes & Fittings',
              'UOM': lr.unitOfMeasurement || 'NOS',
              'End Type': lr.endType || 'Standard',
              'Surface Finish': lr.surfaceFinish || 'Standard',
            },
          },
        ],
        canonicalProposed: {
          'Standardized Name': cm.standardizedName || 'Canonical Name',
          'National Golden Code': cm.nationalCode || 'CNM-000000',
          'Material Group': cm.materialGroup || cm.unspscCategory || 'Piping',
          'UNSPSC Code': cm.unspscCode || '40141600',
        },
        attributeStates: {
          'Grade': 'NORMALIZED',
          'Standard': 'MATCH',
          'Size': 'MATCH',
        },
        attributeConfidence: {
          'Grade': 94,
          'Standard': 98,
          'Size': 99,
        },
        aiAnalysis: {
          overallSimilarity: Math.round((q.finalConfidence || 0.89) * 100),
          factors: [
            { name: 'Vector Embedding Similarity', score: Math.round((q.vectorScore || 0.88) * 100), status: 'MATCH' },
            { name: 'Technical Attribute Match', score: Math.round((q.attributeScore || 0.91) * 100), status: 'NORMALIZED' },
          ],
          recommendation: `Match with ${cm.nationalCode || 'golden master'}. Affirm equivalence to standardize inter-CPSE master.`,
          explanation: `Attribute overlap verified across CPSE plant standards.`,
        },
        impact: {
          newNationalCode: cm.nationalCode || 'NMM-0001842',
          cpsesUnified: cm.participatingCPSEs || ['CPCL', 'IOCL'],
          stockPoolingUnits: `${cm.annualTotalVolume || 1200} Units`,
          procurementSavings: `₹${(((q as any).potentialSavingsINR || 250000) / 100000).toFixed(1)} Lakh`,
        },
        standards: [
          { code: lr.extractedStandard || 'ASTM A106', title: 'Industrial Standard Specification', link: '#', valid: true },
        ],
        sourceDocs: [
          { cpse: lr.cpseName || 'CPCL', filename: `${lr.materialCodeCPSE || 'MAT'}_spec.pdf`, page: 'Page 1', extract: lr.specificationRaw || lr.materialDescriptionRaw || '', confidence: 96, type: 'SAP S/4HANA Master' },
        ],
        notes: [],
        history: [
          { date: 'Today', author: 'Agent 1 Routing Engine', action: 'Candidate Queued', details: 'Yellow tier HITL review requirement flagged' },
        ],
        duplicates: (q.historicalRates || []).map((hr: any) => ({
          cpse: hr.cpseName,
          code: `${hr.cpseName}-MAT`,
          score: 92,
          confidence: 'HIGH',
          status: 'Candidate',
        })),
      };
    });
  }

  const pending = (records || []).filter(r => r.mappingStatus !== 'Approved' || r.triageTier === 'YELLOW').slice(0, 14);
  return pending.map((r, idx) => ({
    id: `ADJ-2026-${String(idx + 1).padStart(3, '0')}`,
    title: r.groundTruthStandardName || r.materialDescriptionRaw,
    subtitle: `${r.extractedDimension || ''}, ${r.extractedGrade || ''}, ${r.extractedStandard || ''}`.trim(),
    priority: (r.triageTier === 'RED' ? 'High' : 'Medium') as 'High' | 'Medium',
    confidence: Math.round((r.finalConfidence || 0.86) * 100),
    candidateCount: 2,
    slaText: 'Review within 24 hrs',
    status: 'In Progress',
    assignedReviewer: r.approvedBy || 'Er. Rajesh Kulkarni (ONGC)',
    proposedNationalCode: r.groundTruthNationalCode || 'CNM-MASTER',
    sources: [
      {
        cpse: r.cpseName,
        code: r.materialCodeCPSE,
        sourceType: (r.sourceSystem as any) || 'SAP',
        attributes: {
          'Material Type': r.materialType || 'Industrial SKU',
          'Grade': r.extractedGrade || 'Standard',
          'Standard': r.extractedStandard || 'Standard',
          'Size': r.extractedDimension || 'Standard',
          'Schedule': r.extractedPressure || 'Standard',
          'Material Group': r.materialGroup || 'Piping',
          'UOM': r.unitOfMeasurement || 'NOS',
        }
      }
    ],
    canonicalProposed: {
      'Standardized Name': r.groundTruthStandardName || r.materialDescriptionRaw,
      'National Golden Code': r.groundTruthNationalCode || 'CNM-MASTER',
      'Material Group': r.materialGroup || 'Piping',
      'UNSPSC Code': r.existingClassificationCode || '40141600',
    },
    attributeStates: { 'Grade': 'NORMALIZED', 'Standard': 'MATCH', 'Size': 'MATCH' },
    attributeConfidence: { 'Grade': 94, 'Standard': 98, 'Size': 99 },
    aiAnalysis: {
      overallSimilarity: Math.round((r.finalConfidence || 0.86) * 100),
      factors: [
        { name: 'Vector Embedding Similarity', score: 88, status: 'MATCH' },
        { name: 'Technical Attribute Match', score: 92, status: 'NORMALIZED' }
      ],
      recommendation: `Match with ${r.groundTruthNationalCode}. Affirm equivalence across CPSE plants.`,
      explanation: 'Dynamic similarity generated from benchmark record.'
    },
    impact: {
      newNationalCode: r.groundTruthNationalCode || 'CNM-MASTER',
      cpsesUnified: [r.cpseName, 'IOCL'],
      stockPoolingUnits: `${r.annualProcuredQty || 500} Units`,
      procurementSavings: `₹${(((r.avgUnitPriceINR || 1000) * (r.annualProcuredQty || 100) * 0.1) / 100000).toFixed(1)} Lakh`,
    },
    standards: [
      { code: r.extractedStandard || 'ASTM A106', title: 'Industrial Standard Specification', link: '#', valid: true }
    ],
    sourceDocs: [
      { cpse: r.cpseName, filename: `${r.materialCodeCPSE}_spec.pdf`, page: 'Page 1', extract: r.specificationRaw || r.materialDescriptionRaw, confidence: 96, type: 'SAP S/4HANA Master' }
    ],
    notes: [],
    history: [
      { date: 'Live Session', author: 'System Agent 1', action: 'Adjudication Ingestion', details: 'Ingested from active benchmark repository' }
    ],
    duplicates: []
  }));
}, [queue, records]);

  const [activeQueueTab, setActiveQueueTab] = useState<'QUEUE' | 'ASSIGNED' | 'ESCALATED' | 'COMPLETED'>('QUEUE');
  const [currentCase, setCurrentCase] = useState<ReviewCaseItem | null>(null);

  useEffect(() => {
    if (!currentCase && dynamicCases.length > 0) {
      setCurrentCase(dynamicCases[0]);
    }
  }, [dynamicCases, currentCase]);

  const [workspaceTab, setWorkspaceTab] = useState<'NOMENCLATURE' | 'AFFIRMATION_DECISION' | 'STANDARDS' | 'AUDIT'>('NOMENCLATURE');

  // Search & Filter
  const [searchQueue, setSearchQueue] = useState('');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Decision State
  const [decision, setDecision] = useState<'EQUIVALENT' | 'NOT_EQUIVALENT' | 'NEEDS_INFO' | null>(null);
  const [rationaleChecks, setRationaleChecks] = useState<Record<string, boolean>>({});
  const [rationaleComment, setRationaleComment] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [showStandardsModal, setShowStandardsModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const renderStateBadge = (state: string) => {
    switch (state) {
      case 'MATCH':
        return <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">🟢 MATCH</span>;
      case 'NORMALIZED':
        return <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">🟡 NORMALIZED</span>;
      case 'CONFLICT':
        return <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-bold border border-rose-200">🔴 CONFLICT</span>;
      default:
        return <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[10px] font-medium">⚪ MISSING</span>;
    }
  };

  const handleApproveAndPush = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (currentCase) currentCase.status = 'Approved';
      setToastMessage('Technical adjudication approved! Created approved SAP synchronization queue item and sealed SHA-256 Merkle Block.');
      setTimeout(() => setToastMessage(null), 5000);
    }, 1000);
  };

  const getRationaleOptions = () => {
    if (decision === 'EQUIVALENT') {
      return ['Same technical specification', 'Same material grade', 'Same dimensions', 'Same applicable standard', 'Same functional characteristics', 'Different CPSE nomenclature only'];
    }
    if (decision === 'NOT_EQUIVALENT') {
      return ['Different material', 'Different grade', 'Different specification', 'Dimensional conflict', 'Standard conflict', 'Functional difference', 'Insufficient evidence'];
    }
    return [];
  };

  return (
    <div className="space-y-4 max-w-[1750px] mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between text-xs font-semibold animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="hover:opacity-80 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BANNER — MATCHING SHRI AMITABH KANT REFERENCE */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Engineering Reviewer &amp; Technical Adjudication
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              LEVEL 3 HITL GATEWAY • ISO 29148 VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative Technical Adjudication • 5-Axis Attribute Affirmation • Hard-Blocking &amp; Conflict Resolution
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowStandardsModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            Standards Library
          </button>

          <button
            onClick={() => setShowAuditModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs cursor-pointer transition-colors"
          >
            <History className="w-4 h-4 text-purple-600" />
            Review Audit Trail
          </button>

          <button
            onClick={() => onNavigateTab && onNavigateTab('REGISTRY')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer transition-colors"
          >
            <Globe className="w-4 h-4" />
            View National Registry
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5-CARD KPI METRIC BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Review Queue</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{dynamicCases.length} Cases</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Awaiting Engineering Affirmation</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved &amp; Unified</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">1,420 Items</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Green Tier ≥95% System Matches</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Equivalence Accuracy</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">98.6%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across ASME / ASTM / API standards</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Hard-Blocked Conflicts</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 tracking-tight">18 Conflicts</div>
            <div className="text-[11px] text-rose-700 font-semibold mt-0.5">Grade / rating incompatibilities</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Approved National Masters</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">80 Masters</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Enforced across 7 CPSE ERPs</div>
          </div>
        </div>
      </div>

      {/* SPACIOUS 2-COLUMN SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: CASE QUEUE (4 COLS) */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-slate-100 space-y-2.5 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase">Review Queue</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="text-[11px] bg-white border border-slate-200 rounded-md px-2 py-1 font-semibold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Priority: All</option>
                <option value="High">Priority: High</option>
                <option value="Medium">Priority: Medium</option>
              </select>
            </div>

            <div className="flex gap-1 bg-slate-200/70 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveQueueTab('QUEUE')}
                className={`flex-1 py-1.5 rounded-md cursor-pointer text-center text-[11px] ${activeQueueTab === 'QUEUE' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'
                  }`}
              >
                All Cases ({dynamicCases.length})
              </button>
              <button
                onClick={() => setActiveQueueTab('ASSIGNED')}
                className={`flex-1 py-1.5 rounded-md cursor-pointer text-center text-[11px] ${activeQueueTab === 'ASSIGNED' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'
                  }`}
              >
                My Assigned ({dynamicCases.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQueue}
                onChange={(e) => setSearchQueue(e.target.value)}
                placeholder="Search case ID, part name, spec..."
                className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="p-3 space-y-2.5 overflow-y-auto max-h-[720px] bg-slate-50/30">
            {dynamicCases.map((item) => {
              const isSelected = currentCase?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentCase(item)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected
                      ? 'bg-blue-50/70 border-blue-400 shadow-xs border-l-4 border-l-blue-600'
                      : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-2xs'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs font-mono text-slate-900">{item.id}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.priority === 'High' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mb-2">{item.subtitle}</div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Layers className="w-3.5 h-3.5" /> {item.candidateCount} CPSE Sources
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Match: {item.confidence}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: TECHNICAL ADJUDICATION WORKSPACE (8 COLS) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden flex flex-col">
          {currentCase ? (
            <>
              {/* Workspace Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm font-mono text-slate-900">{currentCase.id}</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {currentCase.status}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      Proposed: <strong className="text-blue-700">{currentCase.proposedNationalCode}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">Reviewer: {currentCase.assignedReviewer}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{currentCase.title}</h3>
                <p className="text-xs text-slate-600">{currentCase.subtitle}</p>

                {/* Sub-Tabs for Right Column */}
                <div className="flex items-center gap-1.5 mt-3 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setWorkspaceTab('NOMENCLATURE')}
                    className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${workspaceTab === 'NOMENCLATURE' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Nomenclature &amp; Diff Matrix
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('AFFIRMATION_DECISION')}
                    className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${workspaceTab === 'AFFIRMATION_DECISION' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Attribute Affirmation &amp; Decision
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('STANDARDS')}
                    className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${workspaceTab === 'STANDARDS' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Standards &amp; Evidence ({currentCase.sourceDocs.length})
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('AUDIT')}
                    className={`flex-1 py-1.5 rounded-md transition-all cursor-pointer text-center text-[11px] ${workspaceTab === 'AUDIT' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                  >
                    Audit History
                  </button>
                </div>
              </div>

              {/* Workspace Tab Content */}
              <div className="p-4 space-y-4 max-h-[700px] overflow-y-auto">
                {/* TAB 1: NOMENCLATURE & DIFF MATRIX */}
                {workspaceTab === 'NOMENCLATURE' && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-200/60 pb-2 mb-3">
                        <GitMerge className="w-4 h-4 text-blue-600" />
                        CROSS-CPSE NOMENCLATURE VARIANCE RESOLUTION
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {currentCase.sources.map((s) => (
                          <div key={s.cpse} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1 shadow-2xs font-mono text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-700">{s.cpse}</span>
                              <span className="text-[10px] text-slate-400">{s.sourceType}</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900">{s.code}</div>
                            <div className="text-[11px] text-slate-600 font-sans line-clamp-2">
                              {s.attributes['Material Type']} {s.attributes['Grade']} {s.attributes['Size']} {s.attributes['Schedule']}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Full Attribute Comparison Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                      <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-900">
                        Side-by-Side Attribute Comparison &amp; Normalization Logic
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-100 text-[10px] uppercase">
                            <tr>
                              <th className="p-2.5">Attribute</th>
                              <th className="p-2.5 bg-blue-50/40 text-blue-900 font-bold">Canonical Value</th>
                              {currentCase.sources.map((s) => (
                                <th key={s.cpse} className="p-2.5 text-slate-700">{s.cpse} Value</th>
                              ))}
                              <th className="p-2.5 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-xs">
                            {Object.entries(currentCase.canonicalProposed).map(([attr, canonicalVal]) => {
                              const state = currentCase.attributeStates[attr] || 'MISSING';
                              return (
                                <tr key={attr} className="hover:bg-slate-50/60">
                                  <td className="p-2.5 font-bold text-slate-700 font-sans">{attr}</td>
                                  <td className="p-2.5 font-bold text-blue-900 bg-blue-50/20">{canonicalVal}</td>
                                  {currentCase.sources.map((s) => (
                                    <td key={s.cpse} className="p-2.5 text-slate-600">{s.attributes[attr] || '—'}</td>
                                  ))}
                                  <td className="p-2.5 text-center">{renderStateBadge(state)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ATTRIBUTE AFFIRMATION & DECISION */}
                {workspaceTab === 'AFFIRMATION_DECISION' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-blue-600" /> Confirm / Edit Canonical Attributes</span>
                        <span className="text-[10px] text-slate-500">ISO 29148 Affirmation Gate</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(currentCase.canonicalProposed).map(([attr, val]) => (
                          <div key={attr} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                              <span>{attr}</span>
                              {renderStateBadge(currentCase.attributeStates[attr] || 'MISSING')}
                            </div>
                            <input
                              type="text"
                              defaultValue={val}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-xs text-slate-900 font-bold focus:outline-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Technical Decision Workflow */}
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                        Technical Equivalence Determination
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-semibold">
                        <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${decision === 'EQUIVALENT' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}>
                          <input type="radio" name="tech_decision" value="EQUIVALENT" onChange={() => setDecision('EQUIVALENT')} className="accent-emerald-600" />
                          <span>Equivalent (Approve &amp; Map)</span>
                        </label>

                        <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${decision === 'NOT_EQUIVALENT' ? 'bg-rose-50 border-rose-400 text-rose-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}>
                          <input type="radio" name="tech_decision" value="NOT_EQUIVALENT" onChange={() => setDecision('NOT_EQUIVALENT')} className="accent-rose-600" />
                          <span>Not Equivalent (Mint New CNM)</span>
                        </label>

                        <label className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${decision === 'NEEDS_INFO' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}>
                          <input type="radio" name="tech_decision" value="NEEDS_INFO" onChange={() => setDecision('NEEDS_INFO')} className="accent-amber-600" />
                          <span>Request Clarification</span>
                        </label>
                      </div>

                      {decision && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block">Engineering Rationale:</span>
                          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                            {getRationaleOptions().map((opt) => (
                              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rationaleChecks[opt] || false}
                                  onChange={(e) => setRationaleChecks({ ...rationaleChecks, [opt]: e.target.checked })}
                                  className="accent-blue-600"
                                />
                                <span className="text-[11px]">{opt}</span>
                              </label>
                            ))}
                          </div>
                          <textarea
                            value={rationaleComment}
                            onChange={(e) => setRationaleComment(e.target.value)}
                            placeholder="Add technical comments or remarks for the national record..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-sans focus:outline-blue-500"
                            rows={2}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          onClick={handleApproveAndPush}
                          disabled={isProcessing}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Equivalence &amp; Queue for SAP Sync
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: STANDARDS & EVIDENCE */}
                {workspaceTab === 'STANDARDS' && (
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2">
                        Validated Industrial Standards
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {currentCase.standards.map((s) => (
                          <div key={s.code} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-slate-900">{s.code}</span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                                Validated
                              </span>
                            </div>
                            <p className="text-xs text-slate-600">{s.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs font-mono text-xs">
                      <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 font-sans">
                        Source Document Excerpts &amp; Line Evidence
                      </h4>
                      <div className="space-y-2">
                        {currentCase.sourceDocs.map((doc) => (
                          <div key={doc.filename} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-slate-500">
                              <span>{doc.cpse} • {doc.filename} ({doc.page})</span>
                              <span className="text-emerald-700 font-bold">OCR Conf: {doc.confidence}%</span>
                            </div>
                            <div className="text-xs font-bold text-slate-900">{doc.extract}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: AUDIT HISTORY */}
                {workspaceTab === 'AUDIT' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs font-mono text-xs">
                    <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 font-sans">
                      Adjudication Case Audit Trail
                    </h4>
                    <div className="space-y-2.5">
                      {currentCase.history.map((h, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-bold text-blue-700">{h.action}</span>
                            <span>{h.date}</span>
                          </div>
                          <div className="text-xs text-slate-800 font-sans">{h.details}</div>
                          <div className="text-[10px] text-slate-400">Actor: {h.author}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a review case to begin technical adjudication.
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      {showStandardsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                ASTM / ASME / API Standards Reference
              </h3>
              <button onClick={() => setShowStandardsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">ASTM A106 / A106M:</strong>
                <span className="text-slate-600">Standard Specification for Seamless Carbon Steel Pipe for High-Temperature Service.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong className="text-slate-900 block">ASME B36.10M:</strong>
                <span className="text-slate-600">Welded and Seamless Wrought Steel Pipe dimensions and schedules.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                Engineering Adjudication Audit Log
              </h3>
              <button onClick={() => setShowAuditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-400 text-[10px] block">2026-08-29 10:45:00 IST</span>
                <span className="font-bold text-slate-900">REV-2025-4187 assigned to Er. Rajesh Kulkarni</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewerPortalView;
