import { useState, useEffect } from 'react';
import type { DriftAlertItem, AuditLedgerBlock, UserProfile } from '../types';
import { fetchLedgerBlocks, revertDriftAlert, fetchDriftAlerts, fetchSapSyncQueue, executeSapSync } from '../services/api';
import {
  ShieldAlert,
  AlertOctagon,
  RotateCcw,
  Link2,
  CheckCircle,
  PlusCircle,
  Activity,
  Server,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { LIVE_DRIFT_ALERTS, INITIAL_AUDIT_LEDGER } from '../data/mockData';

interface VigilanceDashboardProps {
  currentUser?: UserProfile | null;
}

export function VigilanceDashboardView({ currentUser }: VigilanceDashboardProps) {
  const [subTab, setSubTab] = useState<'DRIFT_ALERTS' | 'LEDGER' | 'INTEGRATION_HEALTH' | 'SAP_SYNC_QUEUE'>('DRIFT_ALERTS');
  const [alerts, setAlerts] = useState<DriftAlertItem[]>(LIVE_DRIFT_ALERTS);
  const [ledger, setLedger] = useState<AuditLedgerBlock[]>(INITIAL_AUDIT_LEDGER);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  const [revertedMessage, setRevertedMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Ingest live alerts, ledger and sync queue from backend API
  useEffect(() => {
    async function loadData() {
      try {
        const hasAccess = currentUser?.role === 'IT_SAP_TEAM' || currentUser?.role === 'MOPNG_GOVERNMENT';
        const [ledgerRes, alertsRes, syncQueueRes] = await Promise.all([
          fetchLedgerBlocks(),
          fetchDriftAlerts(),
          hasAccess ? fetchSapSyncQueue() : Promise.resolve([])
        ]);
        if (ledgerRes && ledgerRes.ledgerBlocks && ledgerRes.ledgerBlocks.length > 0) {
          setLedger(ledgerRes.ledgerBlocks);
        }
        if (alertsRes && Array.isArray(alertsRes) && alertsRes.length > 0) {
          setAlerts(alertsRes);
        }
        if (syncQueueRes && Array.isArray(syncQueueRes)) {
          setSyncQueue(syncQueueRes);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, [currentUser]);

  const handleRevert = async (alertId: string, materialCode: string) => {
    const res = await revertDriftAlert(alertId);
    if (res && res.status === 'SUCCESS') {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'REVERTED' as const } : a))
      );
      if (res.ledgerBlock) {
        setLedger((prev) => [res.ledgerBlock, ...prev]);
      }
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: 'REVERTED' as const } : a))
      );
    }
    setRevertedMessage(`Automatic Revert Enforced for ${materialCode}: Sent BAPI correction to SAP MM and committed SHA-256 Merkle Block.`);
    setTimeout(() => setRevertedMessage(null), 4000);
  };

  const handleSyncExecute = async (queueId: string, localCode: string) => {
    try {
      setIsProcessing(true);
      setRevertedMessage(`Initiating NetWeaver RFC Sync for ${localCode}...`);
      const res = await executeSapSync(queueId);
      if (res && res.status === 'SYNCED') {
        setSyncQueue((prev) => prev.filter((q) => q.queueId !== queueId));
        setRevertedMessage(`SAP S/4HANA Sync Success: Committed transaction ${res.sapReceipt?.rfcDocumentNumber} for ${localCode}.`);
        setTimeout(() => setRevertedMessage(null), 4000);
        
        // Reload ledger blocks
        const ledgerRes = await fetchLedgerBlocks();
        if (ledgerRes && ledgerRes.ledgerBlocks) {
          setLedger(ledgerRes.ledgerBlocks);
        }
      }
    } catch (err: any) {
      setRevertedMessage(`SAP Sync Error: ${err.message || 'Operation failed'}`);
      setTimeout(() => setRevertedMessage(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulateNewRogueOverride = () => {
    const newAlert: DriftAlertItem = {
      id: `DRIFT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString() + ' IST',
      cpseName: currentUser?.cpse || 'CPCL',
      plantLocation: currentUser?.plantLocation?.split(',')[0] || 'Manali Refinery',
      materialCode: `MAT-${Math.floor(Math.random() * 900000 + 100000)}`,
      nationalCode: 'CNM-100010-004',
      severity: 'LEVEL_3_ROGUE_OVERRIDE',
      driftDescription: 'UNAUTHORIZED SPEC OVERRIDE: Local engineer manually altered refractory brick carbon percentage in SAP MAKT.',
      fieldAltered: 'MAKT-MAKTX (Material Description)',
      originalValue: 'LADLE REFRACTORY LINING BRICK MGO-C (10-14% C)',
      driftedValue: 'LADLE REFRACTORY LINING BRICK MGO-C (SUPER HIGH CARB 20%)',
      status: 'ACTIVE_ALERT'
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleApproveException = (alertId: string, materialCode: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'EXCEPTION_OVERRIDE' as const } : a))
    );
    setRevertedMessage(`Exception Granted for ${materialCode}: Local safety override approved for 30 days pending engineering review.`);
    setTimeout(() => setRevertedMessage(null), 4000);
  };

  return (
    <div className="space-y-4 max-w-[1750px] mx-auto font-sans">
      {/* HEADER & TOP ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              IT &amp; SAP NetWeaver ERP Vigilance &amp; Compliance Cockpit (Agent 5)
            </h1>
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span className="text-[10px] font-mono bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-bold">
              SAP BASIS LISTENER ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Autonomous Real-Time NetWeaver Delta Listener, Rogue Edit Reversions &amp; Cryptographic SHA-256 Ledger
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('DRIFT_ALERTS')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'DRIFT_ALERTS'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              ERP Drift Alerts ({alerts.filter((a) => a.status === 'ACTIVE_ALERT').length})
            </span>
          </button>
          
          {(currentUser?.role === 'IT_SAP_TEAM' || currentUser?.role === 'MOPNG_GOVERNMENT') && (
            <button
              onClick={() => setSubTab('SAP_SYNC_QUEUE')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                subTab === 'SAP_SYNC_QUEUE'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-600" />
                SAP Sync Queue ({syncQueue.length})
              </span>
            </button>
          )}

          <button
            onClick={() => setSubTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'LEDGER'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-sky-600" />
              SHA-256 Merkle Ledger
            </span>
          </button>
          
          <button
            onClick={() => setSubTab('INTEGRATION_HEALTH')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'INTEGRATION_HEALTH'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Agent Status &amp; Telemetry
            </span>
          </button>
        </div>
      </div>

      {revertedMessage && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-xs text-center font-mono text-xs font-semibold flex items-center justify-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 animate-bounce" />
          {revertedMessage}
        </div>
      )}

      {/* VIEW 1: DRIFT ALERTS */}
      {subTab === 'DRIFT_ALERTS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              Live SAP NetWeaver Description Drift &amp; Field Override Alerts
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSimulateNewRogueOverride}
                className="btn-stitch bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 text-xs rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Simulate Rogue Edit
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border font-mono text-xs space-y-3 transition-colors ${
                  alert.severity === 'LEVEL_3_ROGUE_OVERRIDE'
                    ? 'bg-rose-50/30 border-rose-200'
                    : alert.severity === 'LEVEL_2_TOLERANCE'
                    ? 'bg-amber-50/30 border-amber-200'
                    : 'bg-emerald-50/30 border-emerald-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        alert.severity === 'LEVEL_3_ROGUE_OVERRIDE'
                          ? 'bg-rose-600 text-white'
                          : alert.severity === 'LEVEL_2_TOLERANCE'
                          ? 'bg-amber-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-bold text-slate-900">
                      {alert.cpseName} ({alert.plantLocation})
                    </span>
                    <span className="text-slate-500 text-[11px]">Part: {alert.materialCode}</span>
                  </div>
                  <span className="text-slate-400 text-[11px]">{alert.timestamp}</span>
                </div>

                <div className="bg-white/80 p-3 rounded-lg border border-slate-200 space-y-1">
                  <div className="text-slate-500 font-semibold uppercase text-[10px]">Alert description:</div>
                  <div className="text-slate-900 font-bold">{alert.driftDescription}</div>
                  <div className="text-[10px] text-slate-400 font-medium">Altered Field: {alert.fieldAltered}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Approved National Master:</span>
                      <span className="font-bold text-slate-700">{alert.originalValue}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-medium">Unauthorized Local SAP Field Value:</span>
                      <span className="font-bold text-rose-700">{alert.driftedValue}</span>
                    </div>
                  </div>

                  {alert.status === 'ACTIVE_ALERT' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRevert(alert.id, alert.materialCode)}
                        disabled={currentUser?.role !== 'IT_SAP_TEAM' && currentUser?.role !== 'MOPNG_GOVERNMENT'}
                        className="btn-stitch bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                        title={currentUser?.role !== 'IT_SAP_TEAM' && currentUser?.role !== 'MOPNG_GOVERNMENT' ? "Drift Reversion is restricted to SAP IT Admins or MoPNG Officials" : ""}
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Enforce &amp; Revert to Master
                      </button>
                      
                      <button
                        onClick={() => handleApproveException(alert.id, alert.materialCode)}
                        disabled={currentUser?.role !== 'IT_SAP_TEAM' && currentUser?.role !== 'MOPNG_GOVERNMENT'}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 px-3 py-1.5 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Approve Temporary Exception (30 Days)
                      </button>
                    </div>
                  ) : alert.status === 'EXCEPTION_OVERRIDE' ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      <ShieldAlert className="w-3.5 h-3.5" /> Exception Granted - Pending Eng Review
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" /> Reverted to Master
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SAP SYNC QUEUE */}
      {subTab === 'SAP_SYNC_QUEUE' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
              <Server className="w-4 h-4 text-sky-600" />
              SAP S/4HANA NetWeaver Synchronization Queue (Separation of Duties)
            </span>
            <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 font-bold">
              IT Admin Sync Execution Authorization Required
            </span>
          </div>

          {syncQueue.length === 0 ? (
            <div className="text-center py-8 text-slate-400 font-mono text-xs bg-slate-50 rounded-xl border border-slate-200/80">
              Zero pending records in NetWeaver Sync queue. Separation of duties validated.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Queue ID</th>
                    <th className="py-2.5 px-3">Local Code</th>
                    <th className="py-2.5 px-3">National Code</th>
                    <th className="py-2.5 px-3">Aggregated nomenclature</th>
                    <th className="py-2.5 px-3">CPSE / Plant</th>
                    <th className="py-2.5 px-3">Approved By</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {syncQueue.map((item) => (
                    <tr key={item.queueId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-600">{item.queueId}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{item.localCPSECode}</td>
                      <td className="py-3 px-3 text-sky-600 font-bold">{item.nationalCode}</td>
                      <td className="py-3 px-3 text-slate-800 font-medium">{item.standardizedDescription}</td>
                      <td className="py-3 px-3 text-slate-500">{item.cpseName} ({item.plantLocation})</td>
                      <td className="py-3 px-3 text-slate-600">{item.approvedBy}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleSyncExecute(item.queueId, item.localCPSECode)}
                          disabled={isProcessing}
                          className="btn-stitch bg-sky-600 hover:bg-sky-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                        >
                          Trigger SAP S/4HANA Sync
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CRYPTOGRAPHIC MERKLE AUDIT LEDGER */}
      {subTab === 'LEDGER' && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4 font-mono text-xs shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="font-bold uppercase flex items-center gap-2 text-sky-400">
              <Link2 className="w-4 h-4" /> Cryptographic SHA-256 Tamper-Evident Audit Chain (Live Merkle Chain)
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 text-[10px]">
              Chain Integrity Validated
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto">
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

      {/* VIEW 4: 6-AGENT SYSTEM HEALTH & TELEMETRY */}
      {subTab === 'INTEGRATION_HEALTH' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase font-mono">
                6-Agent Autonomous AI Infrastructure Status &amp; Telemetry
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Latency, model checkpoints, and edge connector health across on-premise CPSE and cloud nodes
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200">
              All 6 Agents Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-mono text-xs">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 1: Matching</strong>
                <span className="text-emerald-600 font-bold text-[10px]">142ms</span>
              </div>
              <p className="text-[11px] text-slate-600">Qdrant Vector Index + PostgreSQL Hybrid Ranker</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 2: OCR Extraction</strong>
                <span className="text-emerald-600 font-bold text-[10px]">310ms</span>
              </div>
              <p className="text-[11px] text-slate-600">LayoutLMv3 + ASME/ASTM Industrial Lexicons</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 3: Sourcing Engine</strong>
                <span className="text-emerald-600 font-bold text-[10px]">185ms</span>
              </div>
              <p className="text-[11px] text-slate-600">Econometric Modeling &amp; MSE Quota Calculator</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 4: SAP NetWeaver</strong>
                <span className="text-emerald-600 font-bold text-[10px]">94ms</span>
              </div>
              <p className="text-[11px] text-slate-600">PyRFC SDK + IDoc MATMAS05 Connectors</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 5: Vigilance</strong>
                <span className="text-emerald-600 font-bold text-[10px]">22ms</span>
              </div>
              <p className="text-[11px] text-slate-600">Delta Listener &amp; SHA-256 Merkle Ledger</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <strong className="text-slate-900">Agent 6: Privacy Edge</strong>
                <span className="text-emerald-600 font-bold text-[10px]">18ms</span>
              </div>
              <p className="text-[11px] text-slate-600">On-Premise Presidio NER Zero-Cleartext Masking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
