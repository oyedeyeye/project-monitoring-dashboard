import axios from 'axios';

// The baseUrl points to your NestJS backend. 
// For local development it is typically http://localhost:3000
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://papayawhip-eland-294918.hostingersite.com/',
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
        
        // Convert outgoing snake_case data to camelCase for Prisma
        if (config.data && !(config.data instanceof FormData)) {
            config.data = convertKeysToCamelCase(config.data);
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function convertKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToCamelCase);
    } else if (obj !== null && typeof obj === 'object') {
        if (obj instanceof Date) return obj;
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                let newKey = snakeToCamel(key);
                if (newKey === 'projects') {
                    newKey = 'project';
                }
                newObj[newKey] = convertKeysToCamelCase(obj[key]);
            }
        }
        return newObj;
    }
    return obj;
}

// Helper functions for key conversion
function camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function convertKeysToSnakeCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(convertKeysToSnakeCase);
    } else if (obj !== null && typeof obj === 'object') {
        if (obj instanceof Date) return obj;
        const newObj: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                let newKey = camelToSnake(key);
                // Map NestJS Prisma singular 'project' relation to frontend expected plural 'projects'
                if (newKey === 'project') {
                    newKey = 'projects';
                }
                newObj[newKey] = convertKeysToSnakeCase(obj[key]);
            }
        }
        // If the object has an 'id' but no 'project_id', populate 'project_id' to avoid frontend-backend key mismatches
        if (newObj.id && !newObj.project_id) {
            newObj.project_id = newObj.id;
        }
        return newObj;
    }
    return obj;
}

// Interceptor to handle 401 Unauthorized responses and convert response keys to snake_case
api.interceptors.response.use(
    (response) => {
        if (response.data) {
            response.data = convertKeysToSnakeCase(response.data);
        }
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
