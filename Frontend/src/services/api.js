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
  register: (email, password, role = 'user') => api.post('/users/register', { email, password, role }),
};

export const deviceService = {
  getDevices: () => api.get('/devices'),
  registerDevice: (name) => api.post('/devices/register', { name }),
  deleteDevice: (deviceId) => api.delete(`/devices/${encodeURIComponent(deviceId)}`),
  getTelemetry: (deviceId) => api.get(`/devices/${encodeURIComponent(deviceId)}/telemetry`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }),
  sendCommand: (deviceId, command, payload = {}) => api.post(`/devices/${encodeURIComponent(deviceId)}/command`, { command, payload }),
};

export const adminService = {
  getAllDevices: () => api.get('/admin/devices'),
};

export default api;
