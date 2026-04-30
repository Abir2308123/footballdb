// Centralized API service using Axios for all backend communication
import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for consistent error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// === LEAGUE ENDPOINTS ===
export const leagueAPI = {
  getAll: () => API.get('/leagues'),
  getById: (id) => API.get(`/leagues/${id}`),
  create: (data) => API.post('/leagues', data),
  update: (id, data) => API.put(`/leagues/${id}`, data),
  delete: (id) => API.delete(`/leagues/${id}`),
};

// === TEAM ENDPOINTS ===
export const teamAPI = {
  getAll: (params) => API.get('/teams', { params }),
  getById: (id) => API.get(`/teams/${id}`),
  create: (data) => API.post('/teams', data),
  update: (id, data) => API.put(`/teams/${id}`, data),
  delete: (id) => API.delete(`/teams/${id}`),
};

// === PLAYER ENDPOINTS ===
export const playerAPI = {
  getAll: (params) => API.get('/players', { params }),
  getById: (id) => API.get(`/players/${id}`),
  create: (data) => API.post('/players', data),
  update: (id, data) => API.put(`/players/${id}`, data),
  delete: (id) => API.delete(`/players/${id}`),
};

// === MANAGER ENDPOINTS ===
export const managerAPI = {
  getAll: () => API.get('/managers'),
  getById: (id) => API.get(`/managers/${id}`),
  create: (data) => API.post('/managers', data),
  update: (id, data) => API.put(`/managers/${id}`, data),
  delete: (id) => API.delete(`/managers/${id}`),
};

// === VENUE ENDPOINTS ===
export const venueAPI = {
  getAll: () => API.get('/venues'),
  getById: (id) => API.get(`/venues/${id}`),
  create: (data) => API.post('/venues', data),
  update: (id, data) => API.put(`/venues/${id}`, data),
  delete: (id) => API.delete(`/venues/${id}`),
};

// === MATCH ENDPOINTS ===
export const matchAPI = {
  getAll: (params) => API.get('/matches', { params }),
  getRecent: (limit = 5) => API.get('/matches/recent', { params: { limit } }),
  create: (data) => API.post('/matches', data),
  update: (id, data) => API.put(`/matches/${id}`, data),
  delete: (id) => API.delete(`/matches/${id}`),
};

// === STANDINGS ENDPOINTS ===
export const standingsAPI = {
  getByLeague: (leagueId) => API.get(`/standings/${leagueId}`),
  getAll: () => API.get('/standings/all'),
  getDashboardStats: () => API.get('/standings/stats'),
  getStatistics: () => API.get('/standings/statistics'),
};

export default API;
