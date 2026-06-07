const tokenKey = 'digitalcv_admin_token';

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status}`);
  }

  return data;
}

export function getToken() {
  return localStorage.getItem(tokenKey);
}

export function setToken(token) {
  localStorage.setItem(tokenKey, token);
}

export function clearToken() {
  localStorage.removeItem(tokenKey);
}

export async function loginAdmin(username, password) {
  const data = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  }).then(parseResponse);

  setToken(data.token);
  return data;
}

export async function getAdminUser() {
  const token = getToken();

  if (!token) return null;

  return fetch('/api/admin/me', {
    headers: { Authorization: `Bearer ${token}` }
  }).then(parseResponse);
}

export async function logoutAdmin() {
  const token = getToken();

  if (token) {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => null);
  }

  clearToken();
}
