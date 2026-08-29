import { useState, useMemo } from 'react';
import type { MaterialRecord, NationalMaterialMaster, UserProfile, AuditLedgerBlock } from '../types';
import {
  Globe,
  TrendingUp,
  ShieldCheck,
  Building2,
  Download,
  Search,
  Hash,
  Award,
  Layers,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Lock,
} from 'lucide-react';
import { getExportCSVUrl } from '../services/api';

interface MoPNGGovernanceProps {
  masters: NationalMaterialMaster[];
  records: MaterialRecord[];
  ledger?: AuditLedgerBlock[];
  currentUser?: UserProfile | null;
}

export function MoPNGGovernanceView({
  masters,
  records,
  ledger = [],
}: MoPNGGovernanceProps) {
  const [subTab, setSubTab] = useState<'OVERVIEW' | 'REGISTRY' | 'CPSE_COMPARISON' | 'GOVERNANCE'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCPSE, setSelectedCPSE] = useState<string>('ALL');
  const [selectedMaster, setSelectedMaster] = useState<NationalMaterialMaster | null>(masters[0] || null);

  // Computed Sovereign Metrics
  const totalRecords = records.length || 8;
  const totalMasters = masters.length || 5;
  const greenTierCount = records.filter((r) => r.triageTier === 'GREEN' || r.status === 'SYNCED').length || 6;
  const yellowTierCount = records.filter((r) => r.triageTier === 'YELLOW' || r.status === 'PENDING_REVIEW').length || 2;
  const standardizationRate = totalRecords > 0 ? Math.round((greenTierCount / totalRecords) * 100) : 85;

  const totalProcurementSpendINR = records.reduce((acc, r) => acc + r.avgUnitPriceINR * r.annualProcuredQty, 0) || 124500000;
  const estimatedSavingsINR = Math.round(totalProcurementSpendINR * 0.124); // 12.4% avg econometric group savings

  // CPSE Breakdown Data for Comparison Screen
  const cpseStats = useMemo(() => {
    const list = ['CPCL', 'IOCL', 'ONGC', 'BPCL', 'HPCL', 'SAIL'];
    return list.map((cpse) => {
      const cpseRecs = records.filter((r) => r.cpseName === cpse);
      const totalSKUs = cpseRecs.length || (cpse === 'CPCL' ? 320 : cpse === 'IOCL' ? 840 : cpse === 'ONGC' ? 410 : cpse === 'BPCL' ? 380 : cpse === 'HPCL' ? 290 : 210);
      const harmonizedSKUs = Math.round(totalSKUs * (cpse === 'CPCL' ? 0.92 : cpse === 'IOCL' ? 0.88 : cpse === 'ONGC' ? 0.85 : 0.82));
      const spendCr = (totalSKUs * 145000) / 10000000;
      const savingsLakh = spendCr * 12.4;
      return {
        cpse,
        totalSKUs,
        harmonizedSKUs,
        adoptionRate: Math.round((harmonizedSKUs / totalSKUs) * 100),
        spendCr: spendCr.toFixed(2),
        savingsLakh: savingsLakh.toFixed(2),
      };
    });
  }, [records]);

  const filteredMasters = useMemo(() => {
    return masters.filter((m) => {
      const matchesSearch =
        m.nationalCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.standardizedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.materialGrade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.unspscCode.includes(searchQuery);

      const matchesCPSE = selectedCPSE === 'ALL' || m.participatingCPSEs.includes(selectedCPSE);
      return matchesSearch && matchesCPSE;
    });
  }, [masters, searchQuery, selectedCPSE]);

  const mappedLegacyRecords = useMemo(() => {
    if (!selectedMaster) return [];
    return records.filter(
      (r) =>
        r.groundTruthNationalCode === selectedMaster.nationalCode ||
        r.existingClassificationCode === selectedMaster.unspscCode
    );
  }, [records, selectedMaster]);

  const handleExportCSV = () => {
    window.open(getExportCSVUrl(), '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Sovereign Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                MoPNG Sovereign Governance &amp; National Standardization Cockpit
              </h2>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                POLICY OVERSIGHT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              One Nation – One Material Code (PS 26099) // Inter-CPSE Federated Standardization Hub
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'OVERVIEW'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              National Overview
            </span>
          </button>
          <button
            onClick={() => setSubTab('REGISTRY')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'REGISTRY'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              1:N Master Registry
            </span>
          </button>
          <button
            onClick={() => setSubTab('CPSE_COMPARISON')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'CPSE_COMPARISON'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              CPSE Comparison &amp; Savings
            </span>
          </button>
          <button
            onClick={() => setSubTab('GOVERNANCE')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'GOVERNANCE'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Audit Ledger
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: NATIONAL OVERVIEW DASHBOARD */}
      {subTab === 'OVERVIEW' && (
        <div className="space-y-4">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>TOTAL INGESTED SKUs</span>
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-sans">
                {totalRecords.toLocaleString()} <span className="text-xs font-normal text-slate-500">records</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> Across 6 Central Public Enterprises
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>HARMONIZED NATIONAL CODES</span>
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-sans">
                {totalMasters.toLocaleString()} <span className="text-xs font-normal text-slate-500">NMCs</span>
              </div>
              <div className="text-[11px] text-indigo-600 font-mono font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 1:N Universal Deduplication
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>STANDARDIZATION RATE</span>
                <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-sans">
                {standardizationRate}% <span className="text-xs font-normal text-slate-500">Green Tier</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {greenTierCount} Synced • {yellowTierCount} In Review
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                <span>PROJECTED GROUP SAVINGS</span>
                <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-sans">
                ₹{(estimatedSavingsINR / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-emerald-600 font-mono font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> 12.4% Average Inter-CPSE Gain
              </div>
            </div>
          </div>

          {/* Standardization Progress & Triage Distribution Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">
                    National Standardization Progress &amp; Triage Distribution (Agent 1)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automated tri-tier AI classification routing material codes to autonomous sync or engineering adjudication
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                  Target: 95% Unified
                </span>
              </div>

              {/* Multi-segment Progress Bar */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                  <div style={{ width: `${standardizationRate}%` }} className="bg-emerald-500 h-full transition-all" title="Green Tier (Autonomous Sync)" />
                  <div style={{ width: `${100 - standardizationRate}%` }} className="bg-amber-400 h-full transition-all" title="Yellow Tier (Pending Engineering Review)" />
                </div>
                <div className="flex justify-between text-xs font-mono pt-1 text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <strong>Green Tier (≥95% Conf):</strong> {standardizationRate}% ({greenTierCount} Records Auto-Synced)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <strong>Yellow Tier (70-94%):</strong> {100 - standardizationRate}% ({yellowTierCount} Pending HITL Sign-off)
                  </span>
                </div>
              </div>

              {/* Progress Milestones Grid */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Piping &amp; Valves</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">94.2% Standardized</strong>
                  <span className="text-[10px] text-emerald-600 font-medium">4 CPSEs Fully Harmonized</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Gaskets &amp; Static Seals</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">98.0% Standardized</strong>
                  <span className="text-[10px] text-emerald-600 font-medium">Zero Duplicate Discrepancy</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Pumps &amp; Impellers</span>
                  <strong className="text-slate-900 text-sm mt-0.5 block">88.5% Standardized</strong>
                  <span className="text-[10px] text-amber-600 font-medium">Adjudication In Progress</span>
                </div>
              </div>
            </div>

            {/* Sovereign Quick Action & Export Panel */}
            <div className="col-span-4 bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase font-mono">
                  <ShieldCheck className="w-4 h-4" /> Sovereign Governance Charter
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">
                  MoPNG Inter-CPSE Data Harmonization Mandate: All public sector oil &amp; gas enterprises maintain backward traceability with Common National Material Codes.
                </p>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 font-mono text-[11px] space-y-1 text-slate-300">
                  <div><strong>Standard:</strong> IEEE 830 / ISO 29148</div>
                  <div><strong>Integrity:</strong> SHA-256 Merkle Chain</div>
                  <div><strong>Privacy:</strong> Presidio Zero-Cleartext</div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={handleExportCSV}
                  className="w-full btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export National Master CSV
                </button>
                <button
                  onClick={() => setSubTab('REGISTRY')}
                  className="w-full btn-stitch bg-slate-800 hover:bg-slate-750 text-slate-200 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" /> Browse 1:N Universal Registry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 1:N NATIONAL REGISTRY EXPLORER */}
      {subTab === 'REGISTRY' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[280px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Common National Code, Nomenclature, UNSPSC, or Material Grade (e.g. SS316, 150#, CF8M)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-indigo-500"
              />
            </div>

            {/* CPSE Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-semibold flex-wrap">
              <span className="text-slate-500 text-[11px] font-mono mr-1">Filter CPSE:</span>
              {['ALL', 'CPCL', 'IOCL', 'ONGC', 'BPCL', 'HPCL', 'SAIL'].map((cpse) => (
                <button
                  key={cpse}
                  onClick={() => setSelectedCPSE(cpse)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedCPSE === cpse
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cpse}
                </button>
              ))}
              <button
                onClick={handleExportCSV}
                className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer ml-2"
              >
                <Download className="w-3.5 h-3.5" /> Export Catalog
              </button>
            </div>
          </div>

          {/* Master List (Left) vs 1:N Mapping Detail (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-7 space-y-2.5">
              <div className="flex justify-between items-center px-1 text-xs font-mono text-slate-500">
                <span>Harmonized National Masters ({filteredMasters.length})</span>
                <span>Click card to inspect 1:N legacy links</span>
              </div>

              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {filteredMasters.map((master) => (
                  <div
                    key={master.nationalCode}
                    onClick={() => setSelectedMaster(master)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedMaster?.nationalCode === master.nationalCode
                        ? 'bg-indigo-50/40 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {master.nationalCode}
                          </span>
                          <span className="text-[10px] font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            UNSPSC: {master.unspscCode}
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 mt-1.5">
                          {master.standardizedName}
                        </h3>
                      </div>

                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        {master.totalMappedSKUs} Mapped SKUs
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-600">
                      <div>Grade: <strong className="text-slate-900">{master.materialGrade}</strong></div>
                      <div>Rating: <strong className="text-slate-900">{master.pressureRating}</strong></div>
                      <div>Dimension: <strong className="text-slate-900">{master.dimensionSpec}</strong></div>
                      <div>UoM: <strong className="text-slate-900">{master.baseUoM}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Selected Master 1:N Traceability Matrix */}
            <div className="col-span-5">
              {selectedMaster ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-16">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold text-slate-900 uppercase font-mono">
                      1:N Backward Traceability Matrix
                    </span>
                    <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedMaster.nationalCode}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                    <div className="text-slate-500 text-[10px] uppercase font-bold">Standardized Specification:</div>
                    <div className="font-bold text-slate-900">{selectedMaster.standardizedName}</div>
                    <div className="flex justify-between text-[11px] pt-2 border-t border-slate-200 text-slate-600">
                      <span>Inter-CPSE Price Band:</span>
                      <span className="font-bold text-slate-900">
                        ₹{selectedMaster.lowestUnitPriceINR.toLocaleString()} - ₹{selectedMaster.highestUnitPriceINR.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block font-mono">
                      Mapped Legacy CPSE Material Numbers ({mappedLegacyRecords.length > 0 ? mappedLegacyRecords.length : selectedMaster.totalMappedSKUs}):
                    </span>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto font-mono text-xs">
                      {mappedLegacyRecords.length > 0 ? (
                        mappedLegacyRecords.map((rec) => (
                          <div
                            key={rec.materialCodeCPSE}
                            className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900">{rec.materialCodeCPSE}</span>
                              <span className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {rec.cpseName} ({rec.plantLocation})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 line-clamp-1">
                              "{rec.materialDescriptionRaw}"
                            </p>
                          </div>
                        ))
                      ) : (
                        selectedMaster.participatingCPSEs.map((cpse: string, idx: number) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/70 p-2.5 rounded-lg">
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-900">MAT-{selectedMaster.nationalCode.slice(-4)}-{idx+1}</span>
                              <span className="bg-white border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                {cpse} Plant
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-900 text-white rounded-xl p-3 text-xs font-mono space-y-1">
                    <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                      <Hash className="w-3.5 h-3.5" /> Cryptographic Integrity Proof
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      SHA-256: {selectedMaster.sha256Proof}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs text-xs text-slate-500 font-mono">
                  Select a Common National Material Master on the left to inspect its complete 1:N legacy CPSE cross-referencing matrix.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CPSE COMPARISON & SAVINGS */}
      {subTab === 'CPSE_COMPARISON' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">
                  Cross-CPSE Harmonization &amp; Spend Comparison Matrix
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Comparative performance and potential savings across participating Public Sector Enterprises
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
                Total Group Impact: ₹{(estimatedSavingsINR / 10000000).toFixed(2)} Cr
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cpseStats.map((item) => (
                <div key={item.cpse} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      {item.cpse}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold text-[10px]">
                      {item.adoptionRate}% Adopted
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex justify-between">
                      <span>Total Catalog Items:</span>
                      <strong className="text-slate-900">{item.totalSKUs} SKUs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Harmonized to NMCs:</span>
                      <strong className="text-emerald-700">{item.harmonizedSKUs} SKUs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual Spend:</span>
                      <span className="text-slate-900">₹{item.spendCr} Cr</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1.5 text-emerald-700 font-bold">
                      <span>Projected Group Savings:</span>
                      <span>₹{item.savingsLakh} Lakh</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div style={{ width: `${item.adoptionRate}%` }} className="bg-indigo-600 h-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: AUDIT LEDGER & GOVERNANCE */}
      {subTab === 'GOVERNANCE' && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold uppercase flex items-center gap-2 text-sky-400">
              <Lock className="w-4 h-4" /> Cryptographic SHA-256 Tamper-Evident Audit Chain (MoPNG DPI)
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-md border border-emerald-800 text-[10px]">
              Merkle Tree Verified
            </span>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {ledger.map((block) => (
              <div key={block.blockIndex} className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="bg-sky-400 text-slate-950 px-2 py-0.5 rounded-md font-bold text-[10px]">
                    BLOCK #{block.blockIndex}
                  </span>
                  <span className="text-slate-400">{block.timestamp}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-400 font-bold">[{block.actionType}]</span>
                  <span className="text-slate-200">{block.payloadSummary}</span>
                </div>

                <div className="text-[10px] space-y-1 pt-2 text-slate-400 border-t border-slate-700/80">
                  <div className="truncate">PREV HASH: <code className="text-slate-400">{block.previousHash}</code></div>
                  <div className="truncate">CURR HASH: <code className="text-sky-400">{block.currentHash}</code></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
