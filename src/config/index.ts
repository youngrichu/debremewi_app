// Base URL for the WordPress API
export const API_URL = 'https://staging.dubaidebremewi.com';  // Updated to correct domain

// Expo project configuration
export const EXPO_PROJECT_ID = 'your-project-id';  // Your Expo project ID

// API endpoints
export const ENDPOINTS = {
  notifications: '/wp-json/church-app/v1/notifications/',
  notificationRead: (id: string) => `/wp-json/church-app/v1/notifications/${id}/read/`,
  registerToken: '/wp-json/church-app/v1/notifications/register-token/',
};

// API configuration
export const API_CONFIG = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Debug flag
export const DEBUG = true; 