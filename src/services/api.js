import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('aimtpUser'));
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops if refresh fails
    if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      localStorage.removeItem('aimtpUser');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const user = JSON.parse(localStorage.getItem('aimtpUser'));
      
      if (user && user.refreshToken) {
        try {
          // Attempt to refresh
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken: user.refreshToken
          });
          
          // Update the localized store
          user.accessToken = response.data.accessToken;
          localStorage.setItem('aimtpUser', JSON.stringify(user));
          
          // Update the original request header
          originalRequest.headers.Authorization = `Bearer ${user.accessToken}`;
          
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('aimtpUser');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('aimtpUser');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
