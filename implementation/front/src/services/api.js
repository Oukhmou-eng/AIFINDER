// frontend/src/api.js
const BASE_URL = 'http://localhost/mon-projet/backend';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, method, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {};
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    let msg = `Erreur ${response.status}`;
    try {
      const err = await response.json();
      msg = err.message || msg;
    } catch (e) {}
    throw new Error(msg);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function postForm(endpoint, data) {
  const url = `${BASE_URL}${endpoint}`;
  const body = new URLSearchParams(data).toString();
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!response.ok) throw new Error(`Erreur ${response.status}`);
  return response.json();
}

export const get = (endpoint) => request(endpoint, 'GET');
export const post = (endpoint, data) => request(endpoint, 'POST', data);
export const put = (endpoint, data) => request(endpoint, 'PUT', data);
export const patch = (endpoint, data) => request(endpoint, 'PATCH', data);
export const del = (endpoint) => request(endpoint, 'DELETE');