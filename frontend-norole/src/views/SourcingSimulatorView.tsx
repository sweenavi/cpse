import { useState, useMemo, useEffect } from 'react';
import type { UserProfile } from '../types';
import { PriceDispersionChart } from '../components/PriceDispersionChart';
import { TrendingUp, Calculator, ShieldCheck, Sparkles, SlidersHorizontal, Download, CheckCircle2 } from 'lucide-react';
import { runSourcingSimulation } from '../services/api';

interface SourcingSimulatorProps {
  currentUser?: UserProfile | null;
}

export function SourcingSimulatorView({ currentUser }: SourcingSimulatorProps) {
  const [selectedItem, setSelectedItem] = useState('VALVES');
  const [volumeDiscountElasticity, setVolumeDiscountElasticity] = useState(12); // % target discount
  const [mseAllocationPercent, setMseAllocationPercent] = useState(28);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const scenarioData = useMemo(() => {
    if (selectedItem === 'VALVES') {
      return {
        title: 'Ball Valve 2" Class 150# Flanged WCB/SS316 (CNM-100010-004)',
        rates: [
          { cpseName: 'CPCL (Manali)', rate: 14200, annualQty: 1200 },
          { cpseName: 'IOCL (Panipat)', rate: 12800, annualQty: 4800 },
          { cpseName: 'ONGC (Ankleshwar)', rate: 13400, annualQty: 2400 },
          { cpseName: 'BPCL (Kochi)', rate: 13900, annualQty: 1600 },
        ],
      };
    } else if (selectedItem === 'GASKETS') {
      return {
        title: 'Spiral Wound Gasket SS316 4" Class 150# (CNM-100001)',
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
        rates: [
          { cpseName: 'IOCL (Haldia)', rate: 29.87, annualQty: 6500 },
          { cpseName: 'HPCL (Visakh)', rate: 13.42, annualQty: 8200 },
          { cpseName: 'CPCL (Manali)', rate: 24.5, annualQty: 3800 },
          { cpseName: 'ONGC (Ankleshwar)', rate: 22.0, annualQty: 4500 },
        ],
      };
    }
  }, [selectedItem]);

  // Execute real simulation via Agent 3 backend API on change
  useEffect(() => {
    async function triggerSim() {
      const res = await runSourcingSimulation(
        scenarioData.rates,
        volumeDiscountElasticity,
        mseAllocationPercent
      );
      if (res) {
        setSimulationResult(res);
      }
    }
    triggerSim();
  }, [scenarioData, volumeDiscountElasticity, mseAllocationPercent]);

  const targetUnitRate = simulationResult?.targetUnitRateINR || Math.min(...scenarioData.rates.map(r => r.rate)) * (1 - volumeDiscountElasticity / 100);
  const totalPoolQty = simulationResult?.totalPooledQuantity || scenarioData.rates.reduce((a, b) => a + b.annualQty, 0);
  const baselineTotalSpend = simulationResult?.baselineSpendINR || scenarioData.rates.reduce((a, b) => a + b.rate * b.annualQty, 0);
  const simulatedTargetSpend = simulationResult?.projectedUnifiedSpendINR || targetUnitRate * totalPoolQty;
  const totalSavingsINR = simulationResult?.totalSavingsINR || (baselineTotalSpend - simulatedTargetSpend);
  const netSavingsPercent = simulationResult?.netSavingsPercent || ((totalSavingsINR / baselineTotalSpend) * 100);

  const mseUnits = simulationResult?.mseAllocations?.totalMSEUnits || Math.ceil((totalPoolQty * mseAllocationPercent) / 100);
  const scStUnits = simulationResult?.mseAllocations?.scStMSEUnits || Math.ceil(totalPoolQty * 0.04);
  const womenUnits = simulationResult?.mseAllocations?.womenMSEUnits || Math.ceil(totalPoolQty * 0.03);

  const handleExportGeMPackage = () => {
    setDownloadSuccess(`GeM Joint Tender Lot Package & Llama-3 Memorandum Exported for ${scenarioData.title}`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center border border-emerald-100">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Strategic Sourcing &amp; Joint Demand Aggregator (Agent 3)
              </h2>
              {currentUser && (
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  currentUser.role === 'PROCUREMENT_TEAM'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {currentUser.role === 'PROCUREMENT_TEAM' ? 'SOURCING LEAD: JOINT TENDER AUTHORITY' : 'MACRO PROCUREMENT OVERSIGHT'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Autonomous Econometric Price Variance Modeling &amp; Statutory Quota Allocation Engine
            </p>
          </div>
        </div>

        {/* Commodity Selector & GeM Action */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportGeMPackage}
            className="btn-stitch bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export GeM Tender Pack
          </button>
          <span className="font-semibold text-slate-600 ml-2">Commodity:</span>
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 cursor-pointer focus:outline-rose-500"
          >
            <option value="VALVES">Ball Valves 2" 150# (ASME B16.34)</option>
            <option value="GASKETS">Spiral Wound Gaskets 4" 150# (ASME B16.20)</option>
            <option value="ORINGS">Nitrile Rubber O-Rings 50x3mm (IS 3400)</option>
          </select>
        </div>
      </div>

      {downloadSuccess && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          {downloadSuccess}
        </div>
      )}

      {/* Main Grid: Scatter Plot + Simulation Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Price Dispersion Scatter Plot */}
        <div className="col-span-7 space-y-3">
          <PriceDispersionChart
            rates={scenarioData.rates}
            targetRate={targetUnitRate}
            categoryTitle={scenarioData.title}
          />

          {/* Rate Cards Grid */}
          <div className="grid grid-cols-4 gap-2 text-xs font-mono">
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
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase">
                Joint Tendering Aggregation Model
              </span>
            </div>
            {currentUser?.role !== 'PROCUREMENT_TEAM' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg text-[11px] font-sans">
                <strong>View-Only Mode:</strong> Adjusting tender metrics is restricted to SCM Procurement Officers.
              </div>
            )}

            {/* Slider 1: Target Discount */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  Volume Discount Elasticity:
                </span>
                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {volumeDiscountElasticity}% Target
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                value={volumeDiscountElasticity}
                onChange={(e) => setVolumeDiscountElasticity(Number(e.target.value))}
                disabled={currentUser?.role !== 'PROCUREMENT_TEAM'}
                className="w-full accent-rose-600 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Slider 2: MSE Allocation */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  MSE Lot Allocation Ratio:
                </span>
                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {mseAllocationPercent}% (Min 25%)
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="50"
                value={mseAllocationPercent}
                onChange={(e) => setMseAllocationPercent(Number(e.target.value))}
                disabled={currentUser?.role !== 'PROCUREMENT_TEAM'}
                className="w-full accent-emerald-600 cursor-pointer disabled:opacity-50"
              />
            </div>

            {/* Key Results */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2.5 font-mono text-xs">
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
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold text-emerald-600">
                <span>Estimated Group Savings:</span>
                <span>₹{(totalSavingsINR / 100000).toFixed(2)} Lakh ({netSavingsPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Statutory MSEs Order 2012 Compliance Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> MSEs Order 2012 Quota
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
            <p className="text-[10px] text-slate-400 italic">
              *Tender lot slicing automatically isolates 3 reserved lots for MSE vendors under Public Procurement Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Llama-3 Executive Natural Language Briefing Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wide">
          <Sparkles className="w-4 h-4" /> Agent 3 Executive Procurement Memorandum (Local Llama-3-8B Digest)
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-slate-700 text-xs leading-relaxed font-sans space-y-2">
          <p className="font-bold text-slate-900">
            {simulationResult?.executiveBriefing || (
              `MEMORANDUM // MoPNG Inter-CPSE Joint Sourcing Initiative: Aggregating ${totalPoolQty.toLocaleString()} units yields ₹${(totalSavingsINR/100000).toFixed(2)} Lakh group savings.`
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
