import axios from 'axios';

const BASE_URL = 'https://staging.dubaidebremewi.com';
const API_ROUTES = {
  auth: '/simple-jwt-login/v1/auth',
  autoLogin: '/simple-jwt-login/v1/autologin',
  refresh: '/simple-jwt-login/v1/auth/refresh',
  validate: '/simple-jwt-login/v1/auth/validate',
  revoke: '/simple-jwt-login/v1/auth/revoke'
};

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
