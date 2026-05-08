import axios from 'axios';

const api = axios.create({ baseURL: '' });

// Her istekte token ekle
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (username, password) =>
  api.post('/auth/login', { username, password });

export const getEvents = (filters = {}) =>
  api.get('/api/events', { params: filters });

export const createEvent = (data) =>
  api.post('/api/crisis/events', data);

export const updateEvent = (id, data) =>
  api.patch(`/api/crisis/events/${id}`, data);

export const resolveEvent = (id) =>
  api.delete(`/api/crisis/events/${id}`);

export default api;
