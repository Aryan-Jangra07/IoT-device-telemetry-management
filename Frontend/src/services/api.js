import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('iot_user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
let isRedirecting = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem('iot_user');
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/users/login', { email, password }),
  register: (email, password, role = 'user', name) => {
    const payload = { 
      email, 
      password, 
      role: String(role).toLowerCase(), 
      name 
    };
    console.log('[DEBUG] Registration Payload:', payload);
    return api.post('/users/register', payload);
  },
};

export const deviceService = {
  getDevices: () => api.get('/devices'),
  registerDevice: (name, type, config = {}) => api.post('/devices/register', { name, type, config }),
  deleteDevice: (deviceId) => api.delete(`/devices/${encodeURIComponent(deviceId)}`),
  getTelemetry: (deviceId) => api.get(`/devices/${encodeURIComponent(deviceId)}/telemetry`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }),
  sendCommand: (deviceId, command, payload = {}) => api.post(`/devices/${encodeURIComponent(deviceId)}/command`, { command, payload }),
  getAnalytics: () => api.get('/devices/stats/analytics'),
};

export const adminService = {
  getAllDevices: () => api.get('/admin/devices'),
  deleteUser: (id) => api.delete(`/admin/users/${encodeURIComponent(id)}`),
  deleteDevice: (id) => api.delete(`/admin/devices/${encodeURIComponent(id)}`),
};

export default api;
