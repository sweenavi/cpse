import { useState, useEffect } from 'react';
import type {
  MaterialRecord,
  NationalMaterialMaster,
  AdjudicationCandidate,
  AuditLedgerBlock,
  UserProfile,
} from './types';
import { AuthModal } from './components/AuthModal';
import { ReviewerPortalView } from './views/ReviewerPortalView';
import { RegistryExplorerView } from './views/RegistryExplorerView';
import { InventoryCockpitView } from './views/InventoryCockpitView';
import { ProcurementCockpitView } from './views/ProcurementCockpitView';
import { CPSEManagementView } from './views/CPSEManagementView';
import { MoPNGGovernanceView } from './views/MoPNGGovernanceView';
import { LegacyOCRInspectorView } from './views/LegacyOCRInspectorView';
import { VigilanceDashboardView } from './views/VigilanceDashboardView';
import { LegacyMigrationView } from './views/LegacyMigrationView';
import {
  fetchAllRecords,
  fetchAllMasters,
  fetchAdjudicationQueue,
  submitAdjudication,
  fetchHealthStatus,
  fetchLedgerBlocks,
  setAuthUserId,
  getExportCSVUrl,
} from './services/api';
import {
  RAW_BENCHMARK_RECORDS,
  NATIONAL_MASTERS_CATALOG,
  ADJUDICATION_QUEUE,
  INITIAL_AUDIT_LEDGER,
} from './data/mockData';
import {
  Home,
  CheckSquare,
  Globe,
  Copy,
  TrendingUp,
  FileText,
  ShieldAlert,
  UploadCloud,
  Search,
  Bookmark,
  Building2,
  Download,
  FileEdit,
  Bell,
  HelpCircle,
  Shield,
  User,
  ChevronDown,
  Lock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';

export type ActiveTab =
  | 'OVERVIEW'
  | 'REVIEWER'
  | 'REGISTRY'
  | 'DUPLICATES'
  | 'SIMULATOR'
  | 'OCR'
  | 'VIGILANCE'
  | 'LEGACY_MIGRATION';

// Dashboard Access Authority Matrix per Specification & Docx RBAC Matrix
const ROLE_ALLOWED_TABS: Record<string, ActiveTab[]> = {
  MOPNG_GOVERNMENT: ['OVERVIEW', 'REGISTRY', 'REVIEWER', 'DUPLICATES', 'SIMULATOR', 'OCR', 'VIGILANCE', 'LEGACY_MIGRATION'],
  CPSE_MANAGEMENT: ['OVERVIEW', 'OCR', 'LEGACY_MIGRATION', 'REGISTRY', 'REVIEWER', 'DUPLICATES', 'SIMULATOR', 'VIGILANCE'],
  PROCUREMENT_TEAM: ['OVERVIEW', 'SIMULATOR', 'REGISTRY', 'DUPLICATES'],
  ENGINEERING_EXPERT: ['OVERVIEW', 'REVIEWER', 'DUPLICATES', 'REGISTRY', 'OCR', 'LEGACY_MIGRATION'],
  INVENTORY_TEAM: ['OVERVIEW', 'DUPLICATES', 'REGISTRY', 'SIMULATOR'],
  IT_SAP_TEAM: ['OVERVIEW', 'VIGILANCE', 'REGISTRY', 'OCR', 'LEGACY_MIGRATION'],
};

const DEFAULT_ROLE_TAB: Record<string, ActiveTab> = {
  MOPNG_GOVERNMENT: 'REGISTRY',
  CPSE_MANAGEMENT: 'OCR',
  PROCUREMENT_TEAM: 'SIMULATOR',
  ENGINEERING_EXPERT: 'REVIEWER',
  INVENTORY_TEAM: 'DUPLICATES',
  IT_SAP_TEAM: 'VIGILANCE',
};

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('REGISTRY');

  // Core Data States
  const [records, setRecords] = useState<MaterialRecord[]>(RAW_BENCHMARK_RECORDS);
  const [masters, setMasters] = useState<NationalMaterialMaster[]>(NATIONAL_MASTERS_CATALOG);
  const [queue, setQueue] = useState<AdjudicationCandidate[]>(ADJUDICATION_QUEUE);
  const [ledger, setLedger] = useState<AuditLedgerBlock[]>(INITIAL_AUDIT_LEDGER);
  const [backendConnected, setBackendConnected] = useState(false);

  // Ingest from FastAPI Backend on Mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const health = await fetchHealthStatus();
        if (health && health.status === 'HEALTHY') {
          setBackendConnected(true);
          const [recs, msts, q, ledgRes] = await Promise.all([
            fetchAllRecords(),
            fetchAllMasters(),
            fetchAdjudicationQueue(),
            fetchLedgerBlocks(),
          ]);
          if (recs && recs.length > 0) setRecords(recs);
          if (msts && msts.length > 0) setMasters(msts);
          if (q && q.length > 0) setQueue(q);
          if (ledgRes && ledgRes.ledgerBlocks) setLedger(ledgRes.ledgerBlocks);
        }
      } catch (err) {
        console.warn('FastAPI backend offline, running in standalone mode:', err);
      }
    }
    loadBackendData();
  }, []);

  const handleLogin = (user: UserProfile) => {
    setAuthUserId(user.id);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    const defaultTab = DEFAULT_ROLE_TAB[user.role] || 'REGISTRY';
    setActiveTab(defaultTab);
  };

  const isTabPermitted = (tab: ActiveTab) => {
    if (!currentUser) return false;
    const allowed = ROLE_ALLOWED_TABS[currentUser.role];
    return allowed ? allowed.includes(tab) : false;
  };

  const handleApproveCandidate = async (item: AdjudicationCandidate) => {
    if (backendConnected) {
      await submitAdjudication(item.id, 'APPROVE');
    }
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
    setMasters((prev) =>
      prev.map((m) =>
        m.nationalCode === item.candidateMaster.nationalCode
          ? { ...m, totalMappedSKUs: (m.totalMappedSKUs || 1) + 1 }
          : m
      )
    );
    setRecords((prev) =>
      prev.map((r) =>
        r.materialCodeCPSE === item.localRecord.materialCodeCPSE
          ? { ...r, status: 'SYNCED', groundTruthNationalCode: item.candidateMaster.nationalCode }
          : r
      )
    );
  };

  const handleRejectCandidate = async (item: AdjudicationCandidate) => {
    let newNationalCode = `CNM-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;
    if (backendConnected) {
      const res = await submitAdjudication(item.id, 'REJECT');
      if (res && res.newNationalCode) {
        newNationalCode = res.newNationalCode;
      }
    }
    setQueue((prev) => prev.filter((q) => q.id !== item.id));
  };

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-600 selection:text-white">
      {/* SECTION 1 — TOP ENTERPRISE HEADER (Matching Reference Exactly) */}
      <header className="bg-[#0b1120] text-white border-b border-slate-800/80 px-6 py-2.5 sticky top-0 z-40 shadow-sm w-full">
        <div className="w-full flex items-center justify-between gap-4">
          {/* Left Branding: MoPNG Lion Emblem & Titles */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              {/* National Emblem SVG / Badge */}
              <div className="w-8 h-9 flex flex-col items-center justify-center text-amber-400 font-serif">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-amber-400">
                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
                </svg>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-sm text-white tracking-tight">MoPNG</div>
                <div className="text-[10px] text-slate-400 font-normal">Government of India</div>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-700/60 hidden sm:block" />

            <div className="hidden md:block leading-tight">
              <div className="font-bold text-xs text-white tracking-tight">
                National Unified Material Master Platform
              </div>
              <div className="text-[10px] text-slate-400">
                Inter-CPSE Federated Data Infrastructure
              </div>
            </div>
          </div>

          {/* Right Controls: Role Selector, Notifications, Help, Security, Profile */}
          <div className="flex items-center gap-3">
            {/* Active Role Selector Pill */}
            {currentUser && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 bg-[#1e293b] hover:bg-slate-700/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-left transition-all cursor-pointer text-xs"
              >
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Role:</span>
                <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px]">
                  🌐
                </span>
                <span className="font-semibold text-slate-200 text-xs">
                  {currentUser.role === 'MOPNG_GOVERNMENT'
                    ? 'MoPNG Government'
                    : currentUser.role === 'CPSE_MANAGEMENT'
                    ? `${currentUser.cpse} Management`
                    : currentUser.role === 'ENGINEERING_EXPERT'
                    ? 'Engineering Expert'
                    : currentUser.role === 'PROCUREMENT_TEAM'
                    ? 'Procurement Team'
                    : currentUser.role === 'INVENTORY_TEAM'
                    ? 'Inventory Team'
                    : 'IT / SAP Team'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}

            {/* Notification Bell with Badge */}
            <div className="relative cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                12
              </span>
            </div>

            {/* Help Icon */}
            <div
              className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Platform Documentation & Help"
            >
              <HelpCircle className="w-4 h-4" />
            </div>

            {/* Security / Governance Shield */}
            <div
              className="cursor-pointer p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Cryptographic SHA-256 Merkle Ledger Live"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>

            {/* User Profile Avatar & Name */}
            {currentUser && (
              <div
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 pl-2 border-l border-slate-700/80 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
                  <User className="w-4 h-4 text-slate-300" />
                </div>
                <div className="hidden lg:block text-xs font-semibold text-slate-200">
                  {currentUser.name}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content Workspace */}
      {!currentUser ? (
        <section className="flex-1 w-full py-8 flex items-center justify-center">
          <AuthModal
            isOpen={true}
            isLandingMode={true}
            currentUser={null}
            onLogin={handleLogin}
          />
        </section>
      ) : (
        <div className="flex-1 flex w-full">
          {/* SECTION 2 — LEFT ENTERPRISE SIDEBAR (Matching Reference Exactly) */}
          <aside className="w-64 bg-[#0b1120] text-slate-300 border-r border-slate-800/80 flex flex-col flex-shrink-0 z-30 font-sans">
            {/* Top Overview Dashboard */}
            <div className="p-3 pb-1">
              <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-all cursor-pointer text-left text-xs ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">Overview Dashboard</span>
              </button>
            </div>

            {/* Numbered Navigation Tabs List Matching Reference */}
            <div className="px-3 py-1 space-y-1 flex-1 overflow-y-auto text-xs">
              {/* [1] Reviewer Portal */}
              <button
                onClick={() => isTabPermitted('REVIEWER') && setActiveTab('REVIEWER')}
                disabled={!isTabPermitted('REVIEWER')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'REVIEWER'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('REVIEWER')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  1
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Reviewer Portal</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">
                    Engineering Adjudication
                  </div>
                </div>
                {!isTabPermitted('REVIEWER') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [2] National Registry (One Nation, One Code) */}
              <button
                onClick={() => isTabPermitted('REGISTRY') && setActiveTab('REGISTRY')}
                disabled={!isTabPermitted('REGISTRY')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'REGISTRY'
                    ? 'bg-blue-600 text-white font-bold shadow-md'
                    : isTabPermitted('REGISTRY')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold mt-0.5 ${
                    activeTab === 'REGISTRY'
                      ? 'bg-blue-700 text-white'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  2
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">National Registry</div>
                  <div
                    className={`text-[10px] truncate ${
                      activeTab === 'REGISTRY' ? 'text-blue-100 font-normal' : 'text-slate-400'
                    }`}
                  >
                    One Nation, One Code
                  </div>
                </div>
                {!isTabPermitted('REGISTRY') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [3] Duplicate & Cluster Analytics */}
              <button
                onClick={() => isTabPermitted('DUPLICATES') && setActiveTab('DUPLICATES')}
                disabled={!isTabPermitted('DUPLICATES')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'DUPLICATES'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('DUPLICATES')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  3
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Duplicate &amp; Cluster</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">
                    Analytics &amp; Stock Pooling
                  </div>
                </div>
                {!isTabPermitted('DUPLICATES') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [4] Strategic Sourcing Simulator */}
              <button
                onClick={() => isTabPermitted('SIMULATOR') && setActiveTab('SIMULATOR')}
                disabled={!isTabPermitted('SIMULATOR')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'SIMULATOR'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('SIMULATOR')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Strategic Sourcing</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">Simulator</div>
                </div>
                {!isTabPermitted('SIMULATOR') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [5] Legacy OCR Inspector */}
              <button
                onClick={() => isTabPermitted('OCR') && setActiveTab('OCR')}
                disabled={!isTabPermitted('OCR')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'OCR'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('OCR')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  5
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Legacy OCR Inspector</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">
                    (Agent 2 Multimodal)
                  </div>
                </div>
                {!isTabPermitted('OCR') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [6] Vigilance & Drift Monitor */}
              <button
                onClick={() => isTabPermitted('VIGILANCE') && setActiveTab('VIGILANCE')}
                disabled={!isTabPermitted('VIGILANCE')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'VIGILANCE'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('VIGILANCE')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  6
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">
                    Vigilance &amp; Drift Monitor
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">
                    Audit, Alerts &amp; SAP Sync
                  </div>
                </div>
                {!isTabPermitted('VIGILANCE') && <Lock className="w-3 h-3 text-slate-600 mt-1" />}
              </button>

              {/* [7] Legacy Migration */}
              <button
                onClick={() => isTabPermitted('LEGACY_MIGRATION') && setActiveTab('LEGACY_MIGRATION')}
                disabled={!isTabPermitted('LEGACY_MIGRATION')}
                className={`w-full p-2.5 rounded-lg flex items-start gap-3 transition-all cursor-pointer text-left ${
                  activeTab === 'LEGACY_MIGRATION'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : isTabPermitted('LEGACY_MIGRATION')
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5">
                  7
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs leading-tight">Legacy Migration</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate">
                    Pipeline Monitor
                  </div>
                </div>
                {!isTabPermitted('LEGACY_MIGRATION') && (
                  <Lock className="w-3 h-3 text-slate-600 mt-1" />
                )}
              </button>

              {/* SECTION 2B — QUICK ACTIONS (Matching Reference Exactly) */}
              <div className="pt-4 border-t border-slate-800/80 space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Quick Actions
                </div>

                {/* 1. Search National Material */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <span>Search National Material</span>
                </button>

                {/* 2. My Saved Searches */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>My Saved Searches</span>
                </button>

                {/* 3. View My Organization Data */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>View My Organization Data</span>
                </button>

                {/* 4. Download Registry Report */}
                <button
                  onClick={() => window.open(getExportCSVUrl(), '_blank')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download Registry Report</span>
                </button>

                {/* 5. Data Correction Requests */}
                <button
                  onClick={() => setActiveTab('REGISTRY')}
                  className="w-full text-left px-2.5 py-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800/60 flex items-center gap-2.5 cursor-pointer text-xs transition-colors"
                >
                  <FileEdit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data Correction Requests</span>
                </button>
              </div>
            </div>

            {/* Sidebar Bottom Profile Card matching Reference */}
            <div className="p-3 border-t border-slate-800 bg-[#090d16] space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {currentUser.cpse} • {currentUser.plantLocation?.split(',')[0]}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Switch Role</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="flex-1 px-6 py-5 overflow-y-auto">
            {/* OVERVIEW DASHBOARD ROUTER: Dedicated Cockpit per Role */}
            {activeTab === 'OVERVIEW' && (
              currentUser.role === 'MOPNG_GOVERNMENT' ? (
                <MoPNGGovernanceView
                  masters={masters}
                  records={records}
                  ledger={ledger}
                  currentUser={currentUser}
                />
              ) : currentUser.role === 'CPSE_MANAGEMENT' ? (
                <CPSEManagementView records={records} currentUser={currentUser} />
              ) : currentUser.role === 'PROCUREMENT_TEAM' ? (
                <ProcurementCockpitView records={records} currentUser={currentUser} />
              ) : currentUser.role === 'ENGINEERING_EXPERT' ? (
                <ReviewerPortalView
                  queue={queue}
                  onApprove={handleApproveCandidate}
                  onReject={handleRejectCandidate}
                  currentUser={currentUser}
                  onNavigateTab={(tab) => {
                    if (isTabPermitted(tab as ActiveTab)) {
                      setActiveTab(tab as ActiveTab);
                    }
                  }}
                />
              ) : currentUser.role === 'INVENTORY_TEAM' ? (
                <InventoryCockpitView
                  records={records}
                  currentUser={currentUser}
                  onNavigateTab={(tab) => {
                    if (isTabPermitted(tab as ActiveTab)) {
                      setActiveTab(tab as ActiveTab);
                    }
                  }}
                />
              ) : (
                <VigilanceDashboardView
                  currentUser={currentUser}
                  onNavigateTab={(tab) => {
                    if (isTabPermitted(tab as ActiveTab)) {
                      setActiveTab(tab as ActiveTab);
                    }
                  }}
                />
              )
            )}

            {/* Dashboard 2: National Registry */}
            {activeTab === 'REGISTRY' && (
              <RegistryExplorerView
                masters={masters}
                records={records}
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 1: Reviewer Portal */}
            {activeTab === 'REVIEWER' && (
              <ReviewerPortalView
                queue={queue}
                onApprove={handleApproveCandidate}
                onReject={handleRejectCandidate}
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 3: Duplicate & Cluster Analytics */}
            {activeTab === 'DUPLICATES' && (
              <InventoryCockpitView
                records={records}
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 4: Strategic Sourcing Simulator */}
            {activeTab === 'SIMULATOR' && (
              <ProcurementCockpitView
                records={records}
                currentUser={currentUser}
              />
            )}

            {/* Dashboard 5: Legacy OCR Inspector */}
            {activeTab === 'OCR' && (
              <LegacyOCRInspectorView currentUser={currentUser} />
            )}

            {/* Dashboard 6: Vigilance & Drift Monitor */}
            {activeTab === 'VIGILANCE' && (
              <VigilanceDashboardView
                currentUser={currentUser}
                onNavigateTab={(tab) => {
                  if (isTabPermitted(tab as ActiveTab)) {
                    setActiveTab(tab as ActiveTab);
                  }
                }}
              />
            )}

            {/* Dashboard 7: Legacy Migration */}
            {activeTab === 'LEGACY_MIGRATION' && (
              <LegacyMigrationView currentUser={currentUser} />
            )}
          </main>
        </div>
      )}

      {/* Role Switcher Modal */}
      {currentUser && isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          isLandingMode={false}
          currentUser={currentUser}
          onLogin={handleLogin}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
