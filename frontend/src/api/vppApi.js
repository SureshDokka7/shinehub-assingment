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
