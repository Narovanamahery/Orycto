const BASE_URL = 'http://localhost:3001/api';

async function request(method, endpoint, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Erreur ${res.status}`);
  }
  return res.json();
}

export const api = {
  dashboard: {
    get:          () => request('GET', '/dashboard'),
    statistiques: () => request('GET', '/dashboard/statistiques'),
  },

  lapins: {
    getAll: (filters = {}) => {
      const q = new URLSearchParams(filters).toString();
      return request('GET', `/lapins${q ? '?' + q : ''}`);
    },
    getOne: (id)       => request('GET',    `/lapins/${id}`),
    create: (data)     => request('POST',   '/lapins', data),
    update: (id, data) => request('PUT',    `/lapins/${id}`, data),
    delete: (id)       => request('DELETE', `/lapins/${id}`),
  },

  sante: {
    getAll: (filters = {}) => {
      const q = new URLSearchParams(filters).toString();
      return request('GET', `/sante${q ? '?' + q : ''}`);
    },
    create:      (data)      => request('POST',   '/sante', data),
    update:      (id, data)  => request('PUT',    `/sante/${id}`, data),
    delete:      (id)        => request('DELETE', `/sante/${id}`),
    pathologies: ()          => request('GET',    '/sante/pathologies'),
  },

  reproduction: {
    getAll:    ()         => request('GET',    '/reproduction'),
    create:    (data)     => request('POST',   '/reproduction', data),
    delete:    (id)       => request('DELETE', `/reproduction/${id}`),
    portees:   ()         => request('GET',    '/reproduction/portees'),
    naissance: (id, data) => request('POST',   `/reproduction/${id}/naissance`, data),
  },

  alimentation: {
    stocks:        ()     => request('GET',    '/alimentation/stocks'),
    restock:       (data) => request('POST',   '/alimentation/stocks/restock', data),
    distributions: ()     => request('GET',    '/alimentation/distributions'),
    addDist:       (data) => request('POST',   '/alimentation/distributions', data),
    deleteDist:    (id)   => request('DELETE', `/alimentation/distributions/${id}`),
  },
};
