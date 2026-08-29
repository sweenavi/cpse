import { useState, useMemo, useEffect } from 'react';
import type { MaterialRecord, UserProfile } from '../types';
import { PriceDispersionChart } from '../components/PriceDispersionChart';
import {
  TrendingUp,
  Mic,
  MicOff,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Download,
  CheckCircle2,
  Boxes,
  Calculator,
  BarChart3,
} from 'lucide-react';
import { runSourcingSimulation } from '../services/api';

interface ProcurementCockpitProps {
  records?: MaterialRecord[];
  currentUser?: UserProfile | null;
}

export function ProcurementCockpitView({ records = [], currentUser }: ProcurementCockpitProps) {
  const [subTab, setSubTab] = useState<'SOURCING_SIMULATOR' | 'VOICE_SEARCH' | 'PRICE_DISPERSION'>('SOURCING_SIMULATOR');
  const [selectedCommodity, setSelectedCommodity] = useState('VALVES');
  const [volumeDiscountElasticity, setVolumeDiscountElasticity] = useState(12);
  const [mseAllocationPercent, setMseAllocationPercent] = useState(28);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Voice Search States
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sourcing Simulation Dataset
  const scenarioData = useMemo(() => {
    if (selectedCommodity === 'VALVES') {
      return {
        title: 'Ball Valve 2" Class 150# Flanged WCB/SS316 (CNM-100010-004)',
        nationalCode: 'CNM-100010-004',
        rates: [
          { cpseName: 'CPCL (Manali)', rate: 14200, annualQty: 1200 },
          { cpseName: 'IOCL (Panipat)', rate: 12800, annualQty: 4800 },
          { cpseName: 'ONGC (Ankleshwar)', rate: 13400, annualQty: 2400 },
          { cpseName: 'BPCL (Kochi)', rate: 13900, annualQty: 1600 },
        ],
      };
    } else if (selectedCommodity === 'GASKETS') {
      return {
        title: 'Spiral Wound Gasket SS316 4" Class 150# (CNM-100001)',
        nationalCode: 'CNM-100001',
        rates: [
          { cpseName: 'SAIL (Bhilai)', rate: 529.0, annualQty: 2400 },
          { cpseName: 'CPCL (Cauvery)', rate: 495.0, annualQty: 800 },
          { cpseName: 'IOCL (Haldia)', rate: 460.0, annualQty: 3200 },
          { cpseName: 'HPCL (Visakh)', rate: 510.0, annualQty: 1400 },
        ],
      };
    } else {
      return {
        title: 'Nitrile Rubber O-Ring 50x3mm NBR 70A (CNM-100023-005)',
        nationalCode: 'CNM-100023-005',
        rates: [
          { cpseName: 'IOCL (Haldia)', rate: 29.87, annualQty: 6500 },
          { cpseName: 'HPCL (Visakh)', rate: 13.42, annualQty: 8200 },
          { cpseName: 'CPCL (Manali)', rate: 24.5, annualQty: 3800 },
          { cpseName: 'ONGC (Ankleshwar)', rate: 22.0, annualQty: 4500 },
        ],
      };
    }
  }, [selectedCommodity]);

  // Execute simulation API
  useEffect(() => {
    async function triggerSim() {
      const res = await runSourcingSimulation(
        scenarioData.rates,
        volumeDiscountElasticity,
        mseAllocationPercent
      );
      if (res) setSimulationResult(res);
    }
    triggerSim();
  }, [scenarioData, volumeDiscountElasticity, mseAllocationPercent]);

  const targetUnitRate =
    simulationResult?.targetUnitRateINR ||
    Math.min(...scenarioData.rates.map((r) => r.rate)) * (1 - volumeDiscountElasticity / 100);
  const totalPoolQty =
    simulationResult?.totalPooledQuantity ||
    scenarioData.rates.reduce((a, b) => a + b.annualQty, 0);
  const baselineTotalSpend =
    simulationResult?.baselineSpendINR ||
    scenarioData.rates.reduce((a, b) => a + b.rate * b.annualQty, 0);
  const simulatedTargetSpend =
    simulationResult?.projectedUnifiedSpendINR || targetUnitRate * totalPoolQty;
  const totalSavingsINR =
    simulationResult?.totalSavingsINR || baselineTotalSpend - simulatedTargetSpend;
  const netSavingsPercent =
    simulationResult?.netSavingsPercent || (totalSavingsINR / baselineTotalSpend) * 100;

  const mseUnits =
    simulationResult?.mseAllocations?.totalMSEUnits ||
    Math.ceil((totalPoolQty * mseAllocationPercent) / 100);
  const scStUnits =
    simulationResult?.mseAllocations?.scStMSEUnits || Math.ceil(totalPoolQty * 0.04);
  const womenUnits =
    simulationResult?.mseAllocations?.womenMSEUnits || Math.ceil(totalPoolQty * 0.03);

  // Voice Search Handler (Web Speech API)
  const handleToggleVoiceListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      simulateVoiceQuery('Ball Valve 2 inch 150 pound SS316');
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
        setVoiceTranscript('Listening... Speak material specification (e.g. "Ball valve 2 inch 150#")...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
        setSearchQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      simulateVoiceQuery('Ball Valve 2 inch 150 pound SS316');
    }
  };

  const simulateVoiceQuery = (text: string) => {
    setIsListening(true);
    setVoiceTranscript(`[Transcribing Spoken Audio]: "${text}"`);
    setTimeout(() => {
      setSearchQuery(text);
      setIsListening(false);
    }, 1200);
  };

  const voiceFilteredResults = useMemo(() => {
    if (!searchQuery.trim()) return records.slice(0, 4);
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.materialDescriptionRaw.toLowerCase().includes(q) ||
        r.groundTruthStandardName.toLowerCase().includes(q) ||
        r.materialCodeCPSE.toLowerCase().includes(q) ||
        r.groundTruthNationalCode.toLowerCase().includes(q)
    );
  }, [records, searchQuery]);

  const handleExportGeM = () => {
    setDownloadSuccess(`GeM Joint Tender Lot Package Exported for ${scenarioData.title}! 3 Reserved MSE lots generated.`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Strategic Sourcing &amp; Demand Aggregator Cockpit (Agent 3)
              </h2>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {currentUser?.cpse || 'PROCUREMENT'} OVERSIGHT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Econometric Price Dispersion Modeling, Voice Search &amp; Statutory 25% MSE Quota Engine
            </p>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('SOURCING_SIMULATOR')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'SOURCING_SIMULATOR'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5" />
              Joint Demand Simulator
            </span>
          </button>
          <button
            onClick={() => setSubTab('VOICE_SEARCH')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'VOICE_SEARCH'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              Voice-Based Material Search
            </span>
          </button>
          <button
            onClick={() => setSubTab('PRICE_DISPERSION')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'PRICE_DISPERSION'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5" />
              Supplier Rate Comparison
            </span>
          </button>
        </div>
      </div>

      {/* 5-CARD KPI METRIC BAR */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pooled Demand Qty</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{totalPoolQty.toLocaleString()} Units</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Across 4 Public Sector CPSEs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Baseline Annual Spend</span>
            <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">₹{(baselineTotalSpend / 10000000).toFixed(2)} Cr</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dispersed Bilateral Procurements</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Target Group Spend</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-600 tracking-tight">₹{(simulatedTargetSpend / 10000000).toFixed(2)} Cr</div>
            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">GeM Macro Lot Package</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Net Group Savings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 tracking-tight">₹{(totalSavingsINR / 100000).toFixed(2)} Lakh</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{netSavingsPercent.toFixed(1)}% Volume Discount Margin</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Statutory MSE Quota</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 tracking-tight">{mseAllocationPercent.toFixed(1)}%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">MSEs Order 2012 Compliant</div>
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          {downloadSuccess}
        </div>
      )}

      {/* VIEW 1: SOURCING SIMULATOR & JOINT DEMAND AGGREGATION */}
      {subTab === 'SOURCING_SIMULATOR' && (
        <div className="space-y-4">
          {/* Commodity Selector Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700 font-mono">Select Aggregation Target Commodity:</span>
              <select
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 cursor-pointer focus:outline-emerald-500"
              >
                <option value="VALVES">Ball Valves 2" 150# (ASME B16.34)</option>
                <option value="GASKETS">Spiral Wound Gaskets 4" 150# (ASME B16.20)</option>
                <option value="ORINGS">Nitrile Rubber O-Rings 50x3mm (IS 3400)</option>
              </select>
            </div>

            <button
              onClick={handleExportGeM}
              className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export GeM Joint Tender Lot Package
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Left: Price Dispersion Chart */}
            <div className="col-span-7 space-y-3">
              <PriceDispersionChart
                rates={scenarioData.rates}
                targetRate={targetUnitRate}
                categoryTitle={scenarioData.title}
              />

              {/* Rate Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {scenarioData.rates.map((r, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block truncate font-medium">{r.cpseName}</span>
                    <span className="font-bold text-sm text-slate-900 mt-0.5 block">₹{r.rate.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500 block mt-1">{r.annualQty.toLocaleString()} units/yr</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Simulation Controls & Calculated Impact */}
            <div className="col-span-5 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono">
                    Econometric Joint Tendering Model
                  </span>
                </div>

                {/* Slider 1: Target Discount */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                      Volume Discount Elasticity:
                    </span>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      {volumeDiscountElasticity}% Target
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={volumeDiscountElasticity}
                    onChange={(e) => setVolumeDiscountElasticity(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Slider 2: MSE Allocation */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      MSE Lot Allocation Ratio:
                    </span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {mseAllocationPercent}% (Min 25%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="50"
                    value={mseAllocationPercent}
                    onChange={(e) => setMseAllocationPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Key Financial Impact Metrics */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Pooled Demand:</span>
                    <strong className="text-slate-900 font-bold">{totalPoolQty.toLocaleString()} Units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Baseline Dispersed Spend:</span>
                    <span className="font-medium text-slate-800">₹{(baselineTotalSpend / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Projected Unified Spend:</span>
                    <span className="font-medium text-slate-800">₹{(simulatedTargetSpend / 10000000).toFixed(2)} Cr</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-emerald-700">
                    <span>Projected Savings:</span>
                    <span>₹{(totalSavingsINR / 100000).toFixed(2)} Lakh ({netSavingsPercent.toFixed(1)}%)</span>
                  </div>
                </div>
              </div>

              {/* Statutory MSEs Order 2012 Compliance Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <ShieldCheck className="w-4 h-4" /> Statutory MSEs Order 2012 Quota
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                    Mandatory 25% Satisfied
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">TOTAL MSE ({mseAllocationPercent}%)</span>
                    <span className="font-bold text-emerald-400">{mseUnits} units</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">SC/ST MSE (4%)</span>
                    <span className="font-bold text-white">{scStUnits} units</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">WOMEN MSE (3%)</span>
                    <span className="font-bold text-white">{womenUnits} units</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: VOICE-BASED MATERIAL SEARCH */}
      {subTab === 'VOICE_SEARCH' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-sans flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600" />
                  Voice-Based Material Search &amp; Equivalence Engine
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Speak material requests (e.g. "Ball Valve 2 inch 150# SS316") to retrieve Common National Codes and equivalent CPSE parts
                </p>
              </div>

              {/* Quick Voice Prompts */}
              <div className="flex gap-2 text-xs font-mono">
                <button
                  onClick={() => simulateVoiceQuery('Ball Valve 2 inch 150# SS316')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  🎙️ "Ball Valve 2 inch"
                </button>
                <button
                  onClick={() => simulateVoiceQuery('Spiral Wound Gasket 4 inch SS316')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  🎙️ "Spiral Gasket 4in"
                </button>
                <button
                  onClick={() => simulateVoiceQuery('Nitrile O-Ring 50x3mm')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                >
                  🎙️ "Nitrile O-Ring"
                </button>
              </div>
            </div>

            {/* Voice Input Search Bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Speak via microphone or type to search materials across CPSE catalogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-xs font-medium text-slate-900 focus:outline-emerald-500"
                />
              </div>

              <button
                onClick={handleToggleVoiceListening}
                className={`p-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Listening...' : 'Voice Search'}</span>
              </button>
            </div>

            {/* Voice Transcript Output Box */}
            {voiceTranscript && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono flex items-center justify-between gap-2">
                <span className="text-slate-600">
                  <strong className="text-emerald-700">Live Voice Transcript:</strong> {voiceTranscript}
                </span>
                {isListening && (
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                )}
              </div>
            )}
          </div>

          {/* Voice Search Results Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-900 font-mono uppercase block px-1">
              Matching Harmonized Materials ({voiceFilteredResults.length}):
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {voiceFilteredResults.map((rec) => (
                <div
                  key={rec.materialCodeCPSE}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3 font-mono text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                        {rec.groundTruthNationalCode}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1.5 line-clamp-1">
                        {rec.groundTruthStandardName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {rec.cpseName} ({rec.plantLocation})
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-[11px] text-slate-600">
                    <span className="text-[10px] text-slate-400 block uppercase">Local Spec:</span>
                    "{rec.materialDescriptionRaw}"
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400">Avg Unit Price: </span>
                      <strong className="text-slate-900">₹{rec.avgUnitPriceINR.toLocaleString()}</strong>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCommodity('VALVES');
                        setSubTab('SOURCING_SIMULATOR');
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                    >
                      Aggregate Sourcing ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SUPPLIER & PRICE DISPERSION COMPARISON */}
      {subTab === 'PRICE_DISPERSION' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                  Cross-CPSE Supplier Price Dispersion &amp; Rate Variance Analysis
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Identifies rate arbitrations across CPCL, IOCL, ONGC, and BPCL for identical national specifications
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-md border border-rose-100">
                Max Dispersion: 122.6%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">BALL VALVES 2" 150#</span>
                <div className="text-base font-bold text-slate-900">₹12,800 - ₹14,200</div>
                <div className="text-[11px] text-slate-600">Spread: ₹1,400 / unit (10.9% variance)</div>
                <div className="text-[10px] text-emerald-600 font-bold">Lowest: IOCL Panipat (₹12,800)</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">SPIRAL GASKETS 4" 150#</span>
                <div className="text-base font-bold text-slate-900">₹460 - ₹529</div>
                <div className="text-[11px] text-slate-600">Spread: ₹69 / unit (15.0% variance)</div>
                <div className="text-[10px] text-emerald-600 font-bold">Lowest: IOCL Haldia (₹460)</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">NITRILE O-RINGS 50X3MM</span>
                <div className="text-base font-bold text-slate-900">₹13.42 - ₹29.87</div>
                <div className="text-[11px] text-slate-600">Spread: ₹16.45 / unit (122.6% variance)</div>
                <div className="text-[10px] text-emerald-600 font-bold">Lowest: HPCL Visakh (₹13.42)</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
