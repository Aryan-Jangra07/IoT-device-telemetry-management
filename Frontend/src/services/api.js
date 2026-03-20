import axios from 'react'; // Note: importing axios here just to set it up, wait, axios is imported from 'axios'
import axiosInstance from 'axios';

// Create basic axios instance
const api = axiosInstance.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Placeholder functions for future integration
export const loginUser = async (credentials) => {
  // return await api.post('/auth/login', credentials);
  console.log('Dummy login call with:', credentials);
  return { data: { token: 'dummy_token' } };
};

export const registerDevice = async (deviceData) => {
  // return await api.post('/devices/register', deviceData);
  console.log('Dummy register call with:', deviceData);
  return { data: { success: true } };
};

export const getDevices = async () => {
  // return await api.get('/devices');
  console.log('Dummy get devices call');
  return {
    data: [
      { id: 'DEV001', temperature: '22°C', status: 'Online', lastUpdated: '2 mins ago' },
      { id: 'DEV002', temperature: '24°C', status: 'Offline', lastUpdated: '1 hour ago' },
    ]
  };
};

export default api;
