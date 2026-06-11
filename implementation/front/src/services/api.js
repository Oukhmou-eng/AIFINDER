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
  // Utilisation de l'origine si l'URL est relative
  const baseUrl = API_URL.startsWith('http') ? API_URL : window.location.origin + API_URL;
  const url = new URL(baseUrl);
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

  // Gestion plus souple du format de réponse
  if (!response.ok || (payload.success === false)) {
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



// searchTools is a specific function to search for tools with various filters. It constructs the query parameters based on the provided filters and calls the GET method of the API. 

// Dans frontend/src/api.js (après la définition d'api)

export async function searchTools(params) {
  // Construire l'objet des paramètres de requête
  const queryParams = {};
  if (params.q) queryParams.q = params.q;
  if (params.category) queryParams.category = params.category;
  if (params.pricing?.length) queryParams.pricing = params.pricing.join(',');
  if (params.platforms?.length) queryParams.platforms = params.platforms.join(',');
  if (params.functions?.length) queryParams.functions = params.functions.join(',');
  if (params.models?.length) queryParams.models = params.models.join(',');
  if (params.sortBy) queryParams.sortBy = params.sortBy;

  // Utilisation de l'action 'searchTools' pour bénéficier de la recherche avancée
  return api.get('searchTools', queryParams);
}