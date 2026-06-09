import { getToken } from './authService.js';

const defaultTimeout = 8000;

async function requestJson(url, options = {}) {
  const token = getToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || defaultTimeout);
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  let response;

  try {
    response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'La solicitud demoro demasiado.'
      : 'No se pudo conectar con el servidor. Puede estar bloqueado por el navegador.';
    const networkError = new Error(message);
    networkError.cause = error;
    networkError.isNetworkError = true;
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = data.errors ? ` ${data.errors.join(' ')}` : '';
    const error = new Error(`${data.message || `Error ${response.status}`}${detail}`);
    error.status = response.status;
    error.isAuthError = response.status === 401 || response.status === 403;
    throw error;
  }

  return data;
}

export function getAllContent() {
  return requestJson('/api/admin/content');
}

export function saveContent(resource, payload) {
  return requestJson(`/api/admin/content/${resource}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function uploadCvPdf(file) {
  const formData = new FormData();
  formData.append('cv', file);

  return requestJson('/api/admin/settings/cv', {
    method: 'POST',
    body: formData,
    timeout: 30000
  });
}

export function getStatsSummary() {
  return requestJson('/api/admin/metrics/summary');
}

export function getRecentEvents(limit = 50) {
  return requestJson(`/api/admin/metrics/recent?limit=${limit}`);
}
