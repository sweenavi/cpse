import type { XAIAttributeDiff } from '../types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface XAIDiffTableProps {
  diffs: XAIAttributeDiff[];
  finalConfidence: number;
}

export function XAIDiffTable({ diffs, finalConfidence }: XAIDiffTableProps) {
  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Explainable AI (XAI) Attribute Matrix
        </span>
        <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
          CONFIDENCE: {(finalConfidence * 100).toFixed(1)}%
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <th className="py-2 px-3 font-semibold">Attribute</th>
              <th className="py-2 px-3 font-semibold">Local Record</th>
              <th className="py-2 px-3 font-semibold">Candidate National Master</th>
              <th className="py-2 px-3 font-semibold text-right">Match Resolution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {diffs.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-2.5 px-3 font-medium text-slate-800">{row.attributeName}</td>
                <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]" title={row.localSpec}>
                  {row.localSpec}
                </td>
                <td className="py-2.5 px-3 text-slate-900 font-medium truncate max-w-[150px]" title={row.nationalSpec}>
                  {row.nationalSpec}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {row.isMatch ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Match ({row.matchScore})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full line-through">
                      <XCircle className="w-3 h-3 text-rose-600" /> Diff ({row.matchScore})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Token Match
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Spec Variance
          </span>
        </div>
        <span className="text-slate-600 font-medium">Agent 1 Vector Correlation Active</span>
      </div>
    </div>
  );
}
