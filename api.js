import axios from 'axios';

// Axios configures requests relative to host (handled by Vite proxy)
const API = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure token injection
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Endpoint bindings
export const authAPI = {
  login: (email, password) => API.post('/api/auth/login', { email, password }),
  register: (username, email, password, role) => API.post('/api/auth/register', { username, email, password, role }),
  me: () => API.get('/api/auth/me'),
  updatePassword: (currentPassword, newPassword) => API.put('/api/auth/updatepassword', { currentPassword, newPassword })
};

export const predictionsAPI = {
  predict: (metrics) => API.post('/api/predictions/crop', metrics),
  getHistory: () => API.get('/api/predictions/history'),
  getDetails: (id) => API.get(`/api/predictions/${id}`),
  deleteRecord: (id) => API.delete(`/api/predictions/${id}`),
  getOverviewStats: () => API.get('/api/predictions/stats/overview')
};

export const diseaseAPI = {
  analyzeImage: (formData) => API.post('/api/images/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getHistory: () => API.get('/api/images/history'),
  getDetails: (id) => API.get(`/api/images/${id}`),
  deleteRecord: (id) => API.delete(`/api/images/${id}`),
  getOverviewStats: () => API.get('/api/images/stats/overview')
};

export const marketAPI = {
  getPrices: () => API.get('/api/market/prices'),
  getTrends: () => API.get('/api/market/trends'),
  getForecast: () => API.get('/api/market/demand-forecast'),
  getWeatherImpact: () => API.get('/api/market/weather-impact')
};

export const nlpAPI = {
  getLanguages: () => API.get('/api/nlp/languages'),
  translateText: (text, targetLanguage) => API.post('/api/nlp/translate', { text, targetLanguage }),
  getCropInfo: (crop, language) => API.get(`/api/nlp/crop-info/${crop}/${language}`)
};

export const userAPI = {
  getProfile: () => API.get('/api/users/profile'),
  updateProfile: (data) => API.put('/api/users/profile', data),
  getStats: () => API.get('/api/users/stats'),
  deleteAccount: () => API.delete('/api/users/profile')
};

export const feedbackAPI = {
  submitFeedback: (formData) => API.post('/api/feedback', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAllFeedback: () => API.get('/api/feedback')
};

export default API;
