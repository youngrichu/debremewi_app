import axios from 'axios';
import { getCachedData, setCachedData } from './cacheManager';

const BASE_URL = 'https://staging.dubaidebremewi.com';
const API_ROUTES = {
  auth: '/?rest_route=/simple-jwt-login/v1/auth',
  autoLogin: '/?rest_route=/simple-jwt-login/v1/autologin',
  refresh: '/?rest_route=/simple-jwt-login/v1/auth/refresh',
  validate: '/?rest_route=/simple-jwt-login/v1/auth/validate',
  revoke: '/?rest_route=/simple-jwt-login/v1/auth/revoke',
  register: '/?rest_route=/simple-jwt-login/v1/auth/register'
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

export { apiClient as default, API_ROUTES };
