const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.details = data.details;
    throw error;
  }
  return data;
}

export function fetchGroups() {
  return apiRequest('/groups');
}

export function validateEvent(payload) {
  return apiRequest('/events/validate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchBatchById(batchId) {
  return apiRequest(`/batches/${batchId}`);
}

export function fetchBatchCommands(batchId) {
  return apiRequest(`/batches/${batchId}/commands`);
}

export function fetchBatchAudit(batchId) {
  return apiRequest(`/batches/${batchId}/audit`);
}

export function createEvent(payload) {
  return apiRequest('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function dispatchBatch(batchId) {
  return apiRequest(`/batches/${batchId}/dispatch`, {
    method: 'POST',
  });
}

export function retryCommand(commandId) {
  return apiRequest(`/commands/${commandId}/retry`, {
    method: 'POST',
  });
}
