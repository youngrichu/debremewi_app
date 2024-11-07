import axios from 'axios';
import { getCachedData, setCachedData } from './cacheManager';

const BASE_URL = 'https://staging.dubaidebremewi.com';
const API_ROUTES = {
  auth: '/simple-jwt-login/v1/auth',
  autoLogin: '/simple-jwt-login/v1/autologin',
  refresh: '/simple-jwt-login/v1/auth/refresh',
  validate: '/simple-jwt-login/v1/auth/validate',
  revoke: '/simple-jwt-login/v1/auth/revoke',
  register: '/simple-jwt-login/v1/auth/register' // Updated endpoint for registration
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const cachedData = await getCachedData(config.url || '');
  if (cachedData) {
    config.adapter = () => Promise.resolve({ data: cachedData });
  }
  return config;
});

apiClient.interceptors.response.use(async (response) => {
  if (response.config.method === 'get') {
    await setCachedData(response.config.url || '', response.data);
  }
  return response;
});

export default apiClient;
