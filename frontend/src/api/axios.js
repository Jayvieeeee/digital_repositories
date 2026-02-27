import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 300000, // 5 minutes timeout for large file uploads
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS
});

// Add token to requests if it exists
api.interceptors.request.use(
  config => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    console.log('Making request to:', config.url, 'Token exists:', !!token);
    
    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('FormData request detected', {
        url: config.url,
        method: config.method,
        data: Array.from(config.data.entries())
      });
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data instanceof FormData ? 'FormData' : error.config?.data
      }
    });

    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error);
      error.message = 'The request took too long. Please try again.';
    }
    
    // Handle CORS errors
    if (error.message === 'Network Error') {
      console.error('CORS or Network Error - Check if:');
      console.error('1. Laravel server is running (php artisan serve)');
      console.error('2. CORS headers are properly configured');
      console.error('3. The API URL is correct:', api.defaults.baseURL);
    }
    
    // Handle 401 Unauthorized responses
    if (error.response?.status === 401) {
      console.error('Unauthorized - token may have expired');
      
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // You might want to redirect to login here
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;