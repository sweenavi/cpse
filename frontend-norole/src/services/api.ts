let activeUserId: string | null = null;

export function setAuthUserId(userId: string | null) {
  activeUserId = userId;
}

function getAuthHeaders(customHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...customHeaders };
  if (activeUserId) {
    headers['X-User-Id'] = activeUserId;
  }
  return headers;
}

const API_BASE = 'http://localhost:8090/api';

export async function fetchHealthStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch (err) {
    console.warn('Backend API offline, using local state:', err);
    return null;
  }
}

export async function fetchAllRecords() {
  try {
    const res = await fetch(`${API_BASE}/data/records`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch records');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAllMasters() {
  try {
    const res = await fetch(`${API_BASE}/data/masters`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch masters');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchAdjudicationQueue() {
  try {
    const res = await fetch(`${API_BASE}/agent1/queue`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch queue');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function submitAdjudication(adjudicationId: string, action: 'APPROVE' | 'REJECT', modifiedDescription?: string, modifiedGrade?: string) {
  try {
    const res = await fetch(`${API_BASE}/agent1/adjudicate`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        adjudicationId,
        action,
        modifiedDescription,
        modifiedGrade,
      }),
    });
    if (!res.ok) throw new Error('Failed to adjudicate');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runSourcingSimulation(rates: any[], volumeDiscountPercent: number, mseAllocationPercent: number) {
  try {
    const res = await fetch(`${API_BASE}/agent3/sourcing-simulate`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        rates,
        volumeDiscountPercent,
        mseAllocationPercent,
      }),
    });
    if (!res.ok) throw new Error('Simulation failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchLedgerBlocks() {
  try {
    const res = await fetch(`${API_BASE}/agent5/ledger`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Ledger failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function revertDriftAlert(alertId: string) {
  try {
    const res = await fetch(`${API_BASE}/agent5/revert-drift/${alertId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Revert failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDriftAlerts() {
  try {
    const res = await fetch(`${API_BASE}/agent5/drift-alerts`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch drift alerts');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDuplicateClusters() {
  try {
    const res = await fetch(`${API_BASE}/data/duplicates`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch duplicates');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runOCRSpellcheck(rawText: string) {
  try {
    const res = await fetch(`${API_BASE}/agent2/ocr-spellcheck`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ rawText }),
    });
    if (!res.ok) throw new Error('OCR failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function runLiveMatchEvaluation(localDescription: string, masterNationalCode: string) {
  try {
    const res = await fetch(`${API_BASE}/agent1/evaluate-match`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ localDescription, masterNationalCode }),
    });
    if (!res.ok) throw new Error('Match evaluation failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function uploadCSV(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/data/upload-csv`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export function getExportCSVUrl() {
  return `${API_BASE}/data/export-mapped-csv`;
}



export async function uploadOCRImage(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/agent2/ocr-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'OCR failed' }));
      throw new Error(err.detail || 'OCR image processing failed');
    }
    return await res.json();
  } catch (err: any) {
    console.error('OCR image upload error:', err);
    throw err;
  }
}
// ==================== LEGACY MIGRATION API ====================

export async function uploadLegacyFile(file: File) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/legacy-migration/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  } catch (err: any) {
    console.error('Legacy file upload error:', err);
    throw err;
  }
}

export async function triggerLegacyProcess(migrationId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/process`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to process migration');
    return await res.json();
  } catch (err) {
    console.error('Trigger process error:', err);
    throw err;
  }
}

export async function fetchLegacyStatus(migrationId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/status`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch status');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchLegacyRecords(migrationId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/records`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch records');
    return await res.json();
  } catch (err) {
    return [];
  }
}

export async function fetchLegacyPreview(migrationId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/preview`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch preview');
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function updateLegacyRecord(migrationId: string, recordId: string, updates: Record<string, any>, user: string = 'reviewer') {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/records/${recordId}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ updates, user }),
    });
    if (!res.ok) throw new Error('Failed to update record');
    return await res.json();
  } catch (err) {
    console.error('Update record error:', err);
    throw err;
  }
}

export async function approveLegacyRecords(migrationId: string, recordIds: string[] = [], user: string = 'reviewer') {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ record_ids: recordIds, user }),
    });
    if (!res.ok) throw new Error('Failed to approve records');
    return await res.json();
  } catch (err) {
    console.error('Approve records error:', err);
    throw err;
  }
}

export async function rejectLegacyRecord(migrationId: string, recordId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/reject/${recordId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reject record');
    return await res.json();
  } catch (err) {
    console.error('Reject record error:', err);
    throw err;
  }
}

export async function importLegacyRecords(migrationId: string) {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/${migrationId}/import`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to import records');
    return await res.json();
  } catch (err) {
    console.error('Import records error:', err);
    throw err;
  }
}

export function getLegacyExportUrl(migrationId: string, format: 'excel' | 'csv' = 'excel') {
  return `${API_BASE}/legacy-migration/${migrationId}/export?format=${format}`;
}

export function getLegacyImageUrl(migrationId: string) {
  return `${API_BASE}/legacy-migration/${migrationId}/image`;
}

export async function fetchLegacyJobs() {
  try {
    const res = await fetch(`${API_BASE}/legacy-migration/jobs`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch legacy jobs');
    return await res.json();
  } catch (err) {
    return [];
  }
}


// ==================== NEW RBAC & SAP SYNC ENHANCEMENTS ====================

export async function fetchSapSyncQueue() {
  try {
    const res = await fetch(`${API_BASE}/agent4/sap-sync-queue`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch SAP sync queue');
    return await res.json();
  } catch (err) {
    console.error('fetchSapSyncQueue error:', err);
    return [];
  }
}

export async function executeSapSync(queueId: string) {
  try {
    const res = await fetch(`${API_BASE}/agent4/sap-sync-execute`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ queueId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Sync failed' }));
      throw new Error(err.detail || 'SAP Sync failed');
    }
    return await res.json();
  } catch (err: any) {
    console.error('executeSapSync error:', err);
    throw err;
  }
}

export async function fetchAuditLogs() {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  } catch (err) {
    console.error('fetchAuditLogs error:', err);
    return { authLogs: [], roleChangeLogs: [] };
  }
}

export async function changeUserRole(userId: string, newRole: string, reason: string) {
  try {
    const res = await fetch(`${API_BASE}/role-change`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ userId, newRole, reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Role change failed' }));
      throw new Error(err.detail || 'Role change failed');
    }
    return await res.json();
  } catch (err: any) {
    console.error('changeUserRole error:', err);
    throw err;
  }
}

export async function updateMaterialRecord(materialCode: string, updates: {
  standardizedDescription?: string;
  specificationRaw?: string;
  extractedGrade?: string;
  extractedDimension?: string;
  extractedPressure?: string;
  extractedStandard?: string;
  unitOfMeasurement?: string;
}) {
  const res = await fetch(`${API_BASE}/data/records/${materialCode}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to update record' }));
    throw new Error(err.detail || 'Failed to update record');
  }
  return await res.json();
}
