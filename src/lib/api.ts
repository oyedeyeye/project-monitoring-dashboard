import axios from 'axios';

// The baseUrl points to your NestJS backend. 
// For local development it is typically http://localhost:3000
const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || (isLocal ? 'http://localhost:5000' : 'https://papayawhip-eland-294918.hostingersite.com'),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            // Redirect to login if necessary
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

