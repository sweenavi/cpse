import { useState, useEffect } from 'react';
import type { UserProfile } from '../types';
import { Copy, ShieldCheck, CheckCircle2, ArrowRightLeft } from 'lucide-react';
import { fetchDuplicateClusters } from '../services/api';

interface DuplicateItem {
  cpse: string;
  code: string;
  desc: string;
  rate: number;
}

interface DuplicateCluster {
  clusterId: string;
  clusterTitle: string;
  primaryNationalCode: string;
  similarityConfidence: number;
  classification: string;
  participatingCPSEs: string[];
  totalDuplicatedSKUs: number;
  avgPriceVariance: string;
  annualTenderVolume: number;
  estimatedInventorySavingsINR: number;
  items: DuplicateItem[];
}

interface DuplicateClusterProps {
  currentUser?: UserProfile | null;
}

export function DuplicateClusterView({ currentUser }: DuplicateClusterProps) {
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<DuplicateCluster | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [poolActionSuccess, setPoolActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadClusters() {
      try {
        const data = await fetchDuplicateClusters();
        if (data && Array.isArray(data)) {
          setClusters(data);
          if (data.length > 0) setSelectedCluster(data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadClusters();
  }, []);

  const filteredClusters = clusters.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.classification === filterType;
  });

  const totalInventorySavings = clusters.reduce((acc, c) => acc + c.estimatedInventorySavingsINR, 0);
  const totalDuplicatesCount = clusters.reduce((acc, c) => acc + c.totalDuplicatedSKUs, 0);

  const handleInitiatePooling = (cluster: DuplicateCluster) => {
    setPoolActionSuccess(`Inter-Refinery Safety Stock Pool Registered for ${cluster.primaryNationalCode}. Released ₹${(cluster.estimatedInventorySavingsINR/100000).toFixed(2)} Lakh working capital.`);
    setTimeout(() => setPoolActionSuccess(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100">
            <Copy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Inter-CPSE Duplicate &amp; Near-Duplicate Cluster Analytics (Capability 3)
              </h2>
              {currentUser && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  currentUser.role === 'INVENTORY_TEAM'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {currentUser.role === 'INVENTORY_TEAM' ? 'INVENTORY CONTROLLER: SAFETY STOCK POOLING ACTIVE' : 'INVENTORY TELEMETRY'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Autonomous Multidimensional Entity Clustering &amp; Safety Stock Rationalization Hub
            </p>
          </div>
        </div>

        {/* Global Impact Counters */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
            <span className="text-slate-500 block text-[10px]">TOTAL DUPLICATES FOUND</span>
            <strong className="text-slate-900 font-bold">{totalDuplicatesCount} Dispersed SKUs</strong>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
            <span className="text-emerald-600 block text-[10px]">POTENTIAL INVENTORY RELEASE</span>
            <strong className="text-emerald-700 font-bold">₹{(totalInventorySavings / 100000).toFixed(2)} Lakh</strong>
          </div>
        </div>
      </div>

      {poolActionSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          {poolActionSuccess}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-semibold">
        <button
          onClick={() => setFilterType('ALL')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            filterType === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Clusters ({clusters.length})
        </button>
        <button
          onClick={() => setFilterType('EXACT_DUPLICATE')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            filterType === 'EXACT_DUPLICATE'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Exact Duplicates (&gt;98%)
        </button>
        <button
          onClick={() => setFilterType('NEAR_DUPLICATE')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            filterType === 'NEAR_DUPLICATE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Near Duplicates (90-97%)
        </button>
        <button
          onClick={() => setFilterType('FUNCTIONALLY_EQUIVALENT')}
          className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
            filterType === 'FUNCTIONALLY_EQUIVALENT'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          Functionally Equivalent
        </button>
      </div>

      {/* Main Grid: Cluster List (Left) vs Deep-Dive Breakdown (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Cluster List */}
        <div className="col-span-5 space-y-2.5">
          {filteredClusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              onClick={() => setSelectedCluster(cluster)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedCluster?.clusterId === cluster.clusterId
                  ? 'bg-rose-50/40 border-rose-400 shadow-xs ring-1 ring-rose-400'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-center text-xs">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    cluster.classification === 'EXACT_DUPLICATE'
                      ? 'bg-rose-100 text-rose-700'
                      : cluster.classification === 'NEAR_DUPLICATE'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {cluster.classification.replace('_', ' ')}
                </span>
                <span className="font-mono font-bold text-slate-700 text-xs">
                  {cluster.similarityConfidence}% Match
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 mt-2 line-clamp-1">
                {cluster.clusterTitle}
              </h4>

              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                <span>{cluster.totalDuplicatedSKUs} CPSE SKUs Mapped</span>
                <span className="font-semibold text-rose-600">
                  Target: {cluster.primaryNationalCode}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Selected Cluster Detail */}
        {selectedCluster && (
          <div className="col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                  Cluster ID: {selectedCluster.clusterId}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedCluster.clusterTitle}
                </h3>
              </div>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-mono font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Harmonized to {selectedCluster.primaryNationalCode}
              </span>
            </div>

            {/* Cluster Impact Bar */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">CROSS-CPSE VARIANCE</span>
                <strong className="text-slate-900 font-bold">{selectedCluster.avgPriceVariance}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">ANNUAL DEMAND POOL</span>
                <strong className="text-slate-900 font-bold">{selectedCluster.annualTenderVolume.toLocaleString()} Units</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">INVENTORY RATIONALIZATION</span>
                <strong className="text-emerald-600 font-bold">₹{(selectedCluster.estimatedInventorySavingsINR / 100000).toFixed(2)} Lakh</strong>
              </div>
            </div>

            {/* Dispersed Items Table */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block">
                Dispersed Legacy Material Codes Identified:
              </span>
              <div className="space-y-2 font-mono text-xs">
                {selectedCluster.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200/70 p-3 rounded-lg flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold text-slate-700">
                        {item.cpse}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{item.code}</span>
                        <span className="text-[11px] text-slate-600 line-clamp-1">"{item.desc}"</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">HISTORICAL RATE</span>
                      <span className="font-bold text-slate-900 text-xs">₹{item.rate.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rationalization Recommendation & Action Button */}
            <div className="bg-slate-900 text-white rounded-xl p-4 text-xs font-mono space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Recommended MoPNG Action
                </div>
                {currentUser?.role !== 'INVENTORY_TEAM' ? (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-xs font-sans max-w-xs text-center font-bold">
                    View-Only: Safety Stock Pooling is restricted to Inventory Team.
                  </div>
                ) : (
                  <button
                    onClick={() => handleInitiatePooling(selectedCluster)}
                    className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Pool Safety Stock &amp; Release Working Capital
                  </button>
                )}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Consolidate all {selectedCluster.totalDuplicatedSKUs} legacy material master records under Common National Code <code className="text-rose-400 font-bold">{selectedCluster.primaryNationalCode}</code>. Initiate inter-refinery safety stock pooling across {selectedCluster.participatingCPSEs.join(', ')} to release working capital.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
