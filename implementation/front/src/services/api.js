const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/Application-Web_AIFinder/implementation/back/index.php';

export function getToken() {
  return localStorage.getItem('aifinder_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('aifinder_token', token);
  } else {
    localStorage.removeItem('aifinder_token');
  }
}

function buildUrl(params = {}) {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

async function request(action, { method = 'GET', data = null, params = {} } = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = { method, headers };
  const query = { action, ...params };

  if (method !== 'GET' && data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(buildUrl(query), options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Erreur API ${response.status}`);
  }

  return payload;
}

export const api = {
  get: (action, params) => request(action, { method: 'GET', params }),
  post: (action, data, params) => request(action, { method: 'POST', data, params }),
  put: (action, data, params) => request(action, { method: 'PUT', data, params }),
  patch: (action, data, params) => request(action, { method: 'PATCH', data, params }),
  delete: (action, data, params) => request(action, { method: 'DELETE', data, params }),
};

export default api;
