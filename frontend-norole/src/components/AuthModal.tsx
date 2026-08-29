import { useState } from 'react';
import type { UserProfile, UserRole, CPSEEntity } from '../types';
import {
  Building2,
  HardHat,
  UserCheck,
  Lock,
  Mail,
  MapPin,
  IdCard,
  UserPlus,
  LogIn,
  CheckSquare,
  Layers,
  Copy,
  TrendingUp,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Boxes,
  Activity,
  Cpu,
  CheckCircle2,
  X,
} from 'lucide-react';

export interface PersonaConfig extends UserProfile {
  title: string;
  department: string;
  strategicRemit: string;
  primaryCockpitName: string;
  primaryCockpitCode: string;
  primaryCockpitIcon: any;
  capabilities: string[];
  themeColor: {
    primary: string;
    bgBadge: string;
    textBadge: string;
    border: string;
    hoverBorder: string;
    cardBg: string;
    btnBg: string;
    btnHover: string;
    accentGlow: string;
  };
}

export const DEMO_PROFILES_EXTENDED: PersonaConfig[] = [
  {
    id: 'USR-MOPNG-01',
    name: 'Shri Amitabh Kant',
    title: 'Joint Secretary (Procurement & Policy)',
    department: 'MoPNG Central Procurement & DPI Wing',
    email: 'admin@mopng.gov.in',
    cpse: 'MoPNG',
    plantLocation: 'Shastri Bhawan, New Delhi',
    role: 'MOPNG_GOVERNMENT',
    badgeId: 'GOV-MOPNG-001',
    avatarColor: 'bg-indigo-600',
    strategicRemit: 'National standardization, cross-CPSE procurement efficiency & sovereign DPI governance',
    primaryCockpitName: 'National Registry (1:N Master Explorer)',
    primaryCockpitCode: '[2] REGISTRY',
    primaryCockpitIcon: Layers,
    capabilities: [
      '1:N Universal Catalog Explorer',
      'Inter-CPSE Price Dispersion Curves',
      'Public Sector Demand Consolidation',
      'Sovereign Policy Compliance & Oversight',
    ],
    themeColor: {
      primary: 'text-indigo-600',
      bgBadge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      textBadge: 'text-indigo-700',
      border: 'border-indigo-200/80',
      hoverBorder: 'hover:border-indigo-500',
      cardBg: 'bg-gradient-to-b from-indigo-50/40 via-white to-white',
      btnBg: 'bg-indigo-600',
      btnHover: 'hover:bg-indigo-700',
      accentGlow: 'group-hover:shadow-indigo-500/10',
    },
  },
  {
    id: 'USR-CPSE-02',
    name: 'Er. R. Sundaram',
    title: 'General Manager (Materials Management)',
    department: 'Refinery Materials & Standard Specifications',
    email: 'manager@cpcl.co.in',
    cpse: 'CPCL',
    plantLocation: 'Manali Refinery, Chennai',
    role: 'CPSE_MANAGEMENT',
    badgeId: 'CPCL-MGT-4910',
    avatarColor: 'bg-blue-600',
    strategicRemit: 'Clean, harmonized material masters & AI-driven legacy blueprint digitization',
    primaryCockpitName: 'Legacy OCR Inspector (Agent 2 Multimodal)',
    primaryCockpitCode: '[5] OCR INSPECTOR',
    primaryCockpitIcon: FileText,
    capabilities: [
      'Scanned P&ID & Drawing BBox OCR',
      'ASTM / ASME / API Lexicon Disambiguation',
      'Plant-Level S/4HANA SKU Normalization',
      'Batch CSV Ingestion & Reconciliation',
    ],
    themeColor: {
      primary: 'text-blue-600',
      bgBadge: 'bg-blue-100 text-blue-800 border-blue-200',
      textBadge: 'text-blue-700',
      border: 'border-blue-200/80',
      hoverBorder: 'hover:border-blue-500',
      cardBg: 'bg-gradient-to-b from-blue-50/40 via-white to-white',
      btnBg: 'bg-blue-600',
      btnHover: 'hover:bg-blue-700',
      accentGlow: 'group-hover:shadow-blue-500/10',
    },
  },
  {
    id: 'USR-PROC-03',
    name: 'Dr. Neha Verma',
    title: 'Chief General Manager (Strategic Sourcing)',
    department: 'Central SCM & Joint Tendering Authority',
    email: 'procurement@indianoil.in',
    cpse: 'IOCL',
    plantLocation: 'Corporate Sourcing, New Delhi',
    role: 'PROCUREMENT_TEAM',
    badgeId: 'IOCL-SCM-8821',
    avatarColor: 'bg-emerald-600',
    strategicRemit: 'Joint demand pooling, volume elasticity discounts & statutory 25% MSE quota allocation',
    primaryCockpitName: 'Strategic Sourcing Simulator (Agent 3)',
    primaryCockpitCode: '[4] SOURCING SIMULATOR',
    primaryCockpitIcon: TrendingUp,
    capabilities: [
      'Econometric Joint Demand Pooling',
      'MSEs Order 2012 Lot Slicing (25% Min)',
      'Inter-CPSE Rate Variance Modeling',
      'Local Llama-3 Executive Tender Memorandums',
    ],
    themeColor: {
      primary: 'text-emerald-600',
      bgBadge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      textBadge: 'text-emerald-700',
      border: 'border-emerald-200/80',
      hoverBorder: 'hover:border-emerald-500',
      cardBg: 'bg-gradient-to-b from-emerald-50/40 via-white to-white',
      btnBg: 'bg-emerald-600',
      btnHover: 'hover:bg-emerald-700',
      accentGlow: 'group-hover:shadow-emerald-500/10',
    },
  },
  {
    id: 'USR-ENG-04',
    name: 'Er. Rajesh Kulkarni',
    title: 'Senior Chief Materials Engineer',
    department: 'Offshore Technical Standards & Reliability',
    email: 'engineer@ongc.co.in',
    cpse: 'ONGC',
    plantLocation: 'Western Offshore Basin, Mumbai',
    role: 'ENGINEERING_EXPERT',
    badgeId: 'ONGC-ENG-7712',
    avatarColor: 'bg-rose-600',
    strategicRemit: 'Technically correct material equivalence, 5-axis factor review & BAPI sync authorization',
    primaryCockpitName: 'Reviewer Portal (Yellow Tier HITL)',
    primaryCockpitCode: '[1] REVIEWER PORTAL',
    primaryCockpitIcon: CheckSquare,
    capabilities: [
      'Yellow Tier HITL Adjudication Queue',
      'Explainable AI (XAI) Attribute Diff Tables',
      '5-Axis Factor Radar Chart Scoring',
      'Real-Time SAP S/4HANA BAPI MATDOC Sync',
    ],
    themeColor: {
      primary: 'text-rose-600',
      bgBadge: 'bg-rose-100 text-rose-800 border-rose-200',
      textBadge: 'text-rose-700',
      border: 'border-rose-200/80',
      hoverBorder: 'hover:border-rose-500',
      cardBg: 'bg-gradient-to-b from-rose-50/40 via-white to-white',
      btnBg: 'bg-rose-600',
      btnHover: 'hover:bg-rose-700',
      accentGlow: 'group-hover:shadow-rose-500/10',
    },
  },
  {
    id: 'USR-INV-05',
    name: 'Smt. Ananya Sen',
    title: 'Head of Inventory Control & Stores',
    department: 'Central Stores & Capital Rationalization',
    email: 'inventory@sail.co.in',
    cpse: 'SAIL',
    plantLocation: 'Bhilai Steel Plant, Chhattisgarh',
    role: 'INVENTORY_TEAM',
    badgeId: 'SAIL-INV-3011',
    avatarColor: 'bg-amber-600',
    strategicRemit: 'Inter-refinery safety stock pooling, near-duplicate elimination & working capital release',
    primaryCockpitName: 'Duplicate & Cluster Analytics (Capability 3)',
    primaryCockpitCode: '[3] CLUSTERS & INVENTORY',
    primaryCockpitIcon: Copy,
    capabilities: [
      'Multidimensional Entity Clustering Engine',
      'Exact & Near-Duplicate (90-97%) Detection',
      'Cross-Enterprise Safety Stock Pooling',
      'Working Capital Release Optimization',
    ],
    themeColor: {
      primary: 'text-amber-600',
      bgBadge: 'bg-amber-100 text-amber-800 border-amber-200',
      textBadge: 'text-amber-700',
      border: 'border-amber-200/80',
      hoverBorder: 'hover:border-amber-500',
      cardBg: 'bg-gradient-to-b from-amber-50/40 via-white to-white',
      btnBg: 'bg-amber-600',
      btnHover: 'hover:bg-amber-700',
      accentGlow: 'group-hover:shadow-amber-500/10',
    },
  },
  {
    id: 'USR-IT-06',
    name: 'Vikramaditya Rao',
    title: 'Chief Enterprise Architect & SAP Basis Lead',
    department: 'Enterprise Systems & Cyber-Security Audit',
    email: 'it_audit@bpcl.in',
    cpse: 'BPCL',
    plantLocation: 'Mumbai Refinery Complex',
    role: 'IT_SAP_TEAM',
    badgeId: 'BPCL-IT-9920',
    avatarColor: 'bg-slate-800',
    strategicRemit: 'Secure NetWeaver RFC integration, real-time drift alerts & cryptographic SHA-256 ledger audit',
    primaryCockpitName: 'Vigilance & Drift Monitor (Agent 5)',
    primaryCockpitCode: '[6] VIGILANCE & LEDGER',
    primaryCockpitIcon: ShieldAlert,
    capabilities: [
      'Live NetWeaver BAPI Delta Listener',
      'SHA-256 Merkle Chain Tamper-Evident Ledger',
      'Automated Rogue Override Reversion',
      'Presidio Zero-Knowledge Edge Redaction',
    ],
    themeColor: {
      primary: 'text-slate-800',
      bgBadge: 'bg-slate-200 text-slate-800 border-slate-300',
      textBadge: 'text-slate-800',
      border: 'border-slate-300',
      hoverBorder: 'hover:border-slate-600',
      cardBg: 'bg-gradient-to-b from-slate-100/60 via-white to-white',
      btnBg: 'bg-slate-900',
      btnHover: 'hover:bg-slate-800',
      accentGlow: 'group-hover:shadow-slate-500/10',
    },
  },
];

export const DEMO_PROFILES: UserProfile[] = DEMO_PROFILES_EXTENDED.map(
  ({ strategicRemit, title, department, primaryCockpitName, primaryCockpitCode, primaryCockpitIcon, capabilities, themeColor, ...profile }) => profile
);

interface AuthModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  isOpen: boolean;
  isLandingMode?: boolean;
}

export function AuthModal({ onLogin, onClose, isOpen, isLandingMode = false }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'QUICK_PERSONA' | 'SIGNUP' | 'ARCHITECTURE'>('QUICK_PERSONA');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    cpse: 'CPCL' as CPSEEntity,
    department: 'Materials Management',
    plantLocation: '',
    role: 'ENGINEERING_EXPERT' as UserRole,
    badgeId: '',
    complianceCertified: true,
  });

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const newUser: UserProfile = {
      id: `USR-${formData.cpse}-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      email: formData.email,
      cpse: formData.cpse,
      plantLocation: formData.plantLocation || `${formData.cpse} Central Facility`,
      role: formData.role,
      badgeId: formData.badgeId || `${formData.cpse}-AUTH-${Math.floor(Math.random() * 9000 + 1000)}`,
      avatarColor:
        formData.role === 'MOPNG_GOVERNMENT'
          ? 'bg-indigo-600'
          : formData.role === 'CPSE_MANAGEMENT'
          ? 'bg-blue-600'
          : formData.role === 'PROCUREMENT_TEAM'
          ? 'bg-emerald-600'
          : formData.role === 'ENGINEERING_EXPERT'
          ? 'bg-rose-600'
          : formData.role === 'INVENTORY_TEAM'
          ? 'bg-amber-600'
          : 'bg-slate-700',
    };

    onLogin(newUser);
    if (onClose) onClose();
  };

  const filteredPersonas = DEMO_PROFILES_EXTENDED.filter((p) => {
    if (selectedEntityFilter === 'ALL') return true;
    return p.cpse === selectedEntityFilter;
  });

  const content = (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Banner / Hero Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Subtle Background Circuit Decal */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute left-1/3 bottom-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white shadow-lg ring-2 ring-rose-500/30">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-sans">
                    National Unified Material Master Gateway
                  </h1>
                  <span className="text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Sovereign DPI Hub
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Activity className="w-3 h-3" /> FASTAPI &amp; S/4HANA ACTIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-mono mt-0.5">
                  Ministry of Petroleum &amp; Natural Gas (MoPNG) // Inter-CPSE Federated Data Infrastructure
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> Close Gateway
              </button>
            )}
          </div>

          {/* Value Props & Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/90 text-xs font-mono">
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Standard Reference</span>
              <span className="font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> IEEE 830 / ISO 29148
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Participating CPSEs</span>
              <span className="font-bold text-slate-100 mt-0.5 block truncate">
                CPCL • IOCL • ONGC • BPCL • HPCL • SAIL
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Autonomous AI Agents</span>
              <span className="font-bold text-sky-400 flex items-center gap-1 mt-0.5">
                <Cpu className="w-3.5 h-3.5" /> 6 Federated Engine Nodes
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
              <span className="text-slate-400 text-[10px] block uppercase font-bold">Audit Integrity</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5" /> SHA-256 Merkle Chain
              </span>
            </div>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex flex-wrap gap-2 pt-2 bg-slate-800/70 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('QUICK_PERSONA')}
              className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'QUICK_PERSONA'
                  ? 'bg-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              1-Click Stakeholder Personas (6 Core Roles)
            </button>
            <button
              onClick={() => setActiveTab('SIGNUP')}
              className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'SIGNUP'
                  ? 'bg-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              Custom Enterprise Sign-Up &amp; SAP ID Provisioning
            </button>
            <button
              onClick={() => setActiveTab('ARCHITECTURE')}
              className={`flex-1 min-w-[200px] py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'ARCHITECTURE'
                  ? 'bg-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              6-Agent Autonomous Architecture Matrix
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: 1-Click Stakeholder Personas */}
      {activeTab === 'QUICK_PERSONA' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Select Your Enterprise Stakeholder Cockpit
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Click any calibrated role card below to instantly launch into their dedicated operational dashboard with pre-configured RBAC permissions:
              </p>
            </div>

            {/* CPSE Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
              <span className="text-slate-500 text-[11px] font-mono mr-1">Filter Organization:</span>
              {['ALL', 'MoPNG', 'CPCL', 'IOCL', 'ONGC', 'SAIL', 'BPCL'].map((cpse) => (
                <button
                  key={cpse}
                  onClick={() => setSelectedEntityFilter(cpse)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    selectedEntityFilter === cpse
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {cpse}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Large Widescreen Persona Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredPersonas.map((persona) => {
              const CockpitIcon = persona.primaryCockpitIcon;

              return (
                <div
                  key={persona.id}
                  onClick={() => {
                    onLogin(persona);
                    if (onClose) onClose();
                  }}
                  className={`stitch-card ${persona.themeColor.cardBg} border ${persona.themeColor.border} ${persona.themeColor.hoverBorder} rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between gap-4 group relative overflow-hidden`}
                >
                  {/* Top Color Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${persona.themeColor.btnBg}`} />

                  {/* Header Row: Avatar, Name, Designation & Role Badge */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl ${persona.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white`}
                        >
                          {persona.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 leading-tight group-hover:text-rose-600 transition-colors">
                            {persona.name}
                          </div>
                          <div className="text-[11px] font-medium text-slate-600 line-clamp-1">
                            {persona.title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            {persona.cpse} • {persona.badgeId}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-md font-bold uppercase border shadow-2xs ${persona.themeColor.bgBadge}`}
                      >
                        {persona.role.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Plant Location Pill */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono bg-white/90 p-2 rounded-lg border border-slate-200/80 shadow-2xs">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate font-medium">{persona.plantLocation}</span>
                    </div>

                    {/* Strategic Operational Remit Box */}
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-xl space-y-1 shadow-inner">
                      <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> Strategic Operational Mandate
                      </div>
                      <p className="text-xs font-sans text-slate-200 leading-relaxed font-medium">
                        "{persona.strategicRemit}"
                      </p>
                    </div>

                    {/* Primary Cockpit Highlight */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 uppercase font-bold">Primary Target Cockpit:</span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {persona.primaryCockpitCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                        <CockpitIcon className="w-4 h-4 text-rose-600 shrink-0" />
                        <span className="truncate">{persona.primaryCockpitName}</span>
                      </div>
                    </div>

                    {/* Key Capabilities List */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Included Autonomous Capabilities:
                      </span>
                      <div className="grid grid-cols-1 gap-1 text-[11px] font-mono text-slate-600">
                        {persona.capabilities.map((cap, i) => (
                          <div key={i} className="flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Big Action CTA Button */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <button
                      className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${persona.themeColor.btnBg} ${persona.themeColor.btnHover} group-hover:shadow-lg cursor-pointer`}
                    >
                      <span>Enter {persona.name.split(' ')[0]}'s Workspace</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom Enterprise Sign-Up Form */}
      {activeTab === 'SIGNUP' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-rose-600" />
              Custom Enterprise User Registration &amp; SAP Identity Provisioning
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Provision a new authenticated session with customized CPSE credentials, plant assignment, and role permissions:
            </p>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-slate-500" /> Full Name &amp; Academic/Technical Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar / Er. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-slate-500" /> Official Enterprise / MoPNG Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.kumar@cpcl.co.in or priya@indianoil.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-500" /> CPSE Enterprise Organization *
                </label>
                <select
                  value={formData.cpse}
                  onChange={(e) => setFormData({ ...formData, cpse: e.target.value as CPSEEntity })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="CPCL">CPCL — Chennai Petroleum Corporation Limited</option>
                  <option value="IOCL">IOCL — Indian Oil Corporation Limited</option>
                  <option value="ONGC">ONGC — Oil and Natural Gas Corporation</option>
                  <option value="BPCL">BPCL — Bharat Petroleum Corporation Limited</option>
                  <option value="HPCL">HPCL — Hindustan Petroleum Corporation Limited</option>
                  <option value="SAIL">SAIL — Steel Authority of India Limited</option>
                  <option value="NTPC">NTPC — National Thermal Power Corporation</option>
                  <option value="MoPNG">MoPNG — Ministry of Petroleum &amp; Natural Gas</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-slate-500" /> Stakeholder Role / Operational Cockpit *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none cursor-pointer"
                >
                  <option value="MOPNG_GOVERNMENT">🏛️ MoPNG / Government (National Registry Explorer)</option>
                  <option value="CPSE_MANAGEMENT">🏭 CPSE Management (Legacy OCR &amp; Blueprint Digitizer)</option>
                  <option value="PROCUREMENT_TEAM">🛒 Procurement Team (Strategic Sourcing &amp; MSE Quotas)</option>
                  <option value="ENGINEERING_EXPERT">🔧 Engineering Expert (Reviewer Portal &amp; XAI Radar)</option>
                  <option value="INVENTORY_TEAM">📦 Inventory Team (Duplicate Cluster &amp; Safety Stock)</option>
                  <option value="IT_SAP_TEAM">💻 IT / SAP Team (Vigilance &amp; Merkle Ledger)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500" /> Plant / Refinery / Administrative Complex
                </label>
                <input
                  type="text"
                  placeholder="e.g. Manali Refinery, Chennai / Panipat Complex / Shastri Bhawan"
                  value={formData.plantLocation}
                  onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <IdCard className="w-4 h-4 text-slate-500" /> Enterprise Badge / Employee ID Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CPCL-ENG-8402 / IOCL-SCM-1920"
                  value={formData.badgeId}
                  onChange={(e) => setFormData({ ...formData, badgeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Compliance Guarantee Checkbox */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="complianceCert"
                checked={formData.complianceCertified}
                onChange={(e) => setFormData({ ...formData, complianceCertified: e.target.checked })}
                className="mt-0.5 w-4 h-4 accent-rose-600 cursor-pointer"
              />
              <label htmlFor="complianceCert" className="text-xs text-slate-700 leading-relaxed cursor-pointer">
                <strong>Enterprise Certification &amp; Zero-Cleartext Compliance:</strong> I certify that access to this session adheres to the MoPNG Data Governance Charter. All local SAP MM material master records ingested will undergo on-premise Presidio NER anonymization before cloud embedding synchronization.
              </label>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-500">
                Generated Identity: <strong className="text-slate-900">{formData.cpse}-AUTH-TEMP</strong>
              </div>

              <button
                type="submit"
                className="btn-stitch bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Provision Session &amp; Launch Cockpit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: 6-Agent Autonomous Architecture Matrix */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-rose-600" />
              6-Agent Autonomous AI Pipeline Technical Matrix
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Autonomous federated agents operating across on-premise CPSE edge nodes and the Central DPI Cloud Hub:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded font-mono">Agent 1</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (&lt;250ms)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Matching &amp; Routing Engine</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                Qdrant Vector Index + PostgreSQL structured attribute matcher with tri-tier classification (Green &ge;95%, Yellow 70-94%, Red &lt;70%).
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Tri-Tier Mappings &amp; Common National Codes
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-mono">Agent 2</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (&gt;85% Conf)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Legacy OCR &amp; Blueprint Agent</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                Multimodal LayoutLMv3 + Tesseract 5.0 with specialized industrial lexicons (ASME B16.34, ASTM A276, API 6D, IS 3400).
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Structured Key-Value JSON Attribute Payloads
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">Agent 3</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (Llama-3-8B)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Strategic Sourcing &amp; Insights</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                Statistical price variance modeling, volume elasticity simulation, and MSEs Order 2012 statutory lot reservation engine.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Joint Tendering Matrices &amp; Executive Briefings
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded font-mono">Agent 4</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (PyRFC BAPI)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">SAP S/4HANA Reconciliation</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                Idempotent bi-directional SAP MM line-item key updates via NetWeaver RFC SDK and IDoc MATMAS05 connectors.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Real-time S/4HANA MARA/MAKT Synchronizations
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded font-mono">Agent 5</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (Merkle Chain)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Vigilance &amp; Drift Monitor</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                Continuous SAP NetWeaver delta listener with automated rogue edit reversion and SHA-256 Merkle chain cryptographic logs.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Tamper-Evident Audit Ledger &amp; Drift Alerts
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded font-mono">Agent 6</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">ONLINE (Presidio NER)</span>
              </div>
              <h3 className="font-bold text-xs text-slate-900">Local Privacy Edge Enclave</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed font-mono">
                On-premise zero-knowledge masking of commercial vendor rates and plant tags, generating 1024-dim BGE vector embeddings.
              </p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                Output: Anonymized Vector Stream over TLS 1.3
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // If in landing page mode (full page), render directly inside a rich container
  if (isLandingMode) {
    return <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">{content}</div>;
  }

  // Otherwise, render as a wide, majestic modal overlay
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-100 border border-slate-300 rounded-3xl max-w-6xl w-full shadow-2xl p-4 sm:p-6 my-auto animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
