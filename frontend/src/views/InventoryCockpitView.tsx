import { useState, useEffect, useMemo } from 'react';
import type { MaterialRecord, UserProfile } from '../types';
import {
  Copy,
  ShieldCheck,
  CheckCircle2,
  Boxes,
  ArrowRightLeft,
  Search,
  Mic,
  MicOff,
  AlertTriangle,
} from 'lucide-react';
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

interface InventoryCockpitProps {
  records?: MaterialRecord[];
  currentUser?: UserProfile | null;
}

export function InventoryCockpitView({ records = [], currentUser }: InventoryCockpitProps) {
  const [subTab, setSubTab] = useState<'CLUSTERS' | 'STOCK_VISIBILITY' | 'VOICE_SEARCH' | 'ALERTS'>('CLUSTERS');
  const [clusters, setClusters] = useState<DuplicateCluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<DuplicateCluster | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [poolActionSuccess, setPoolActionSuccess] = useState<string | null>(null);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

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

  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (filterType === 'ALL') return true;
      return c.classification === filterType;
    });
  }, [clusters, filterType]);

  const totalInventorySavings = clusters.reduce((acc, c) => acc + c.estimatedInventorySavingsINR, 0);
  const totalDuplicatesCount = clusters.reduce((acc, c) => acc + c.totalDuplicatedSKUs, 0);

  const handleInitiatePooling = (cluster: DuplicateCluster) => {
    setPoolActionSuccess(
      `Inter-Refinery Safety Stock Pool Registered for ${cluster.primaryNationalCode}. Released ₹${(
        cluster.estimatedInventorySavingsINR / 100000
      ).toFixed(2)} Lakh working capital across ${cluster.participatingCPSEs.join(', ')}.`
    );
    setTimeout(() => setPoolActionSuccess(null), 4500);
  };

  // Voice Search Handler
  const handleToggleVoiceListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      simulateVoiceQuery('Nitrile O-Ring 50x3mm');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('Listening... Speak part or warehouse tag...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
        setInventorySearch(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      simulateVoiceQuery('Nitrile O-Ring 50x3mm');
    }
  };

  const simulateVoiceQuery = (text: string) => {
    setIsListening(true);
    setVoiceTranscript(`[Transcribing Voice Audio]: "${text}"`);
    setTimeout(() => {
      setInventorySearch(text);
      setIsListening(false);
    }, 1000);
  };

  const searchedInventoryRecords = useMemo(() => {
    if (!inventorySearch.trim()) return records;
    const q = inventorySearch.toLowerCase();
    return records.filter(
      (r) =>
        r.materialDescriptionRaw.toLowerCase().includes(q) ||
        r.groundTruthStandardName.toLowerCase().includes(q) ||
        r.materialCodeCPSE.toLowerCase().includes(q) ||
        r.groundTruthNationalCode.toLowerCase().includes(q) ||
        r.plantLocation.toLowerCase().includes(q)
    );
  }, [records, inventorySearch]);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Inter-CPSE Inventory, Duplicate &amp; Safety Stock Controller (Capability 3)
              </h2>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                {currentUser?.cpse || 'INVENTORY'} CAPITAL OPTIMIZATION
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Multidimensional Duplicate Detection, Cross-Refinery Stock Visibility &amp; Safety Stock Pooling
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('CLUSTERS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'CLUSTERS'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Copy className="w-3.5 h-3.5" />
              Duplicate Clusters
            </span>
          </button>
          <button
            onClick={() => setSubTab('STOCK_VISIBILITY')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'STOCK_VISIBILITY'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              Cross-Plant Stock Visibility
            </span>
          </button>
          <button
            onClick={() => setSubTab('VOICE_SEARCH')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'VOICE_SEARCH'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              Inventory Voice Search
            </span>
          </button>
          <button
            onClick={() => setSubTab('ALERTS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'ALERTS'
                ? 'bg-white text-amber-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Redundancy Alerts
            </span>
          </button>
        </div>
      </div>

      {poolActionSuccess && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          {poolActionSuccess}
        </div>
      )}

      {/* VIEW 1: DUPLICATE CLUSTERS & POOLING */}
      {subTab === 'CLUSTERS' && (
        <div className="space-y-4">
          {/* Top Counter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs font-mono text-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">TOTAL DISPERSED DUPLICATES</span>
              <strong className="text-slate-900 text-lg mt-0.5 block">{totalDuplicatesCount} Legacy SKUs</strong>
              <span className="text-[11px] text-amber-600 font-medium">Mapped to 4 National Codes</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs font-mono text-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">POTENTIAL CAPITAL RELEASE</span>
              <strong className="text-emerald-700 text-lg mt-0.5 block">₹{(totalInventorySavings / 100000).toFixed(2)} Lakh</strong>
              <span className="text-[11px] text-emerald-600 font-medium">Through Safety Stock Pooling</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs font-mono text-xs">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">REFINERY ENTITIES INVOLVED</span>
              <strong className="text-slate-900 text-lg mt-0.5 block">CPCL, IOCL, ONGC, BPCL, SAIL</strong>
              <span className="text-[11px] text-indigo-600 font-medium">Active Federated Sharing</span>
            </div>
          </div>

          {/* Filter Pills */}
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

          {/* Main Grid: Cluster List (Left) vs Detail & Pooling Action (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="col-span-5 space-y-2.5">
              {filteredClusters.map((cluster) => (
                <div
                  key={cluster.clusterId}
                  onClick={() => setSelectedCluster(cluster)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedCluster?.clusterId === cluster.clusterId
                      ? 'bg-amber-50/40 border-amber-400 shadow-xs ring-1 ring-amber-400'
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
                    <span className="font-semibold text-amber-700">
                      Target: {cluster.primaryNationalCode}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {selectedCluster && (
              <div className="col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
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

                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">PRICE VARIANCE</span>
                    <strong className="text-slate-900 font-bold">{selectedCluster.avgPriceVariance}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ANNUAL VOLUME</span>
                    <strong className="text-slate-900 font-bold">{selectedCluster.annualTenderVolume.toLocaleString()} Units</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CAPITAL RELEASE</span>
                    <strong className="text-emerald-600 font-bold">₹{(selectedCluster.estimatedInventorySavingsINR / 100000).toFixed(2)} Lakh</strong>
                  </div>
                </div>

                {/* Dispersed Items Table */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide block font-mono">
                    Dispersed Legacy Material Codes Across Refineries:
                  </span>
                  <div className="space-y-2 font-mono text-xs">
                    {selectedCluster.items.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/70 p-3 rounded-xl flex flex-wrap justify-between items-center gap-2">
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

                {/* Pooling Action Button */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs font-mono space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> Recommended Inventory Action
                    </div>
                    <button
                      onClick={() => handleInitiatePooling(selectedCluster)}
                      className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" /> Pool Safety Stock &amp; Release Capital
                    </button>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Consolidate {selectedCluster.totalDuplicatedSKUs} duplicate items under National Code <strong className="text-amber-400">{selectedCluster.primaryNationalCode}</strong>. Inter-refinery safety stock pooling across {selectedCluster.participatingCPSEs.join(', ')} releases ₹{(selectedCluster.estimatedInventorySavingsINR/100000).toFixed(2)} Lakh working capital.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: CROSS-PLANT STOCK VISIBILITY */}
      {subTab === 'STOCK_VISIBILITY' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                  Cross-Refinery Material Master Stock Summary
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time stock quantities and locations for harmonized Common National Codes
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-200">
                6 Participating Facilities
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {records.map((rec) => (
                <div key={rec.materialCodeCPSE} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded text-[11px]">
                        {rec.groundTruthNationalCode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1 line-clamp-1">
                        {rec.groundTruthStandardName}
                      </h4>
                    </div>
                    <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold text-[10px]">
                      {rec.cpseName} ({rec.plantLocation})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Stock Volume</span>
                      <strong className="text-slate-900">{rec.annualProcuredQty} {rec.unitOfMeasurement}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Avg Unit Rate</span>
                      <strong className="text-slate-900">₹{rec.avgUnitPriceINR.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase">Total Value</span>
                      <strong className="text-emerald-700">₹{((rec.annualProcuredQty * rec.avgUnitPriceINR) / 100000).toFixed(2)} Lakh</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: INVENTORY VOICE SEARCH */}
      {subTab === 'VOICE_SEARCH' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
                  <Mic className="w-4 h-4 text-amber-600" />
                  Voice-Based Inventory &amp; Stock Query
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Speak inventory items to locate stock across CPCL Manali, IOCL Panipat, and ONGC warehouses
                </p>
              </div>

              <div className="flex gap-2 text-xs font-mono">
                <button
                  onClick={() => simulateVoiceQuery('Ball Valve 2 inch')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  🎙️ "Ball Valve 2in"
                </button>
                <button
                  onClick={() => simulateVoiceQuery('Spiral Gasket')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  🎙️ "Spiral Gasket"
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Speak via microphone or type to search inventory stock..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-amber-500"
                />
              </div>

              <button
                onClick={handleToggleVoiceListening}
                className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
              </button>
            </div>

            {voiceTranscript && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono">
                <span className="text-amber-800 font-bold">Voice Transcript: </span>
                <span className="text-slate-700">{voiceTranscript}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 font-mono uppercase block px-1">
              Matching Inventory Records ({searchedInventoryRecords.length}):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchedInventoryRecords.map((rec) => (
                <div key={rec.materialCodeCPSE} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{rec.materialCodeCPSE}</span>
                    <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px]">
                      {rec.groundTruthNationalCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">"{rec.materialDescriptionRaw}"</p>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                    <span>{rec.plantLocation}</span>
                    <span>Stock: <strong className="text-slate-900">{rec.annualProcuredQty} {rec.unitOfMeasurement}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: REDUNDANCY & DUPLICATE STOCK ALERTS */}
      {subTab === 'ALERTS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-slate-900 uppercase flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Inter-Refinery Stock Redundancy &amp; Fragmentation Warnings
              </span>
              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
                3 Active Warnings
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-amber-900 text-xs">BALL VALVE 2" 150# FRAGMENTATION</strong>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">HIGH REDUNDANCY</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Identified 4 separate safety stock buffers across CPCL Manali, IOCL Panipat, ONGC Ankleshwar, and BPCL Kochi for identical 2" Class 150# Ball Valves. Pooling reduces total buffer holding by 35%.
                </p>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <strong className="text-amber-900 text-xs">NITRILE O-RING 50X3MM RATE ARBITRAGE</strong>
                  <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">PRICE SPREAD 122%</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  IOCL Haldia purchasing at ₹29.87/unit while HPCL Visakh purchasing at ₹13.42/unit for identical IS 3400 NBR 70A O-Rings. Reallocate vendor contract to unify rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
