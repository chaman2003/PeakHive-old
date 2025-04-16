import axios from 'axios';

// Get the environment
const nodeEnv = import.meta.env.VITE_NODE_ENV || 'development';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 
    (nodeEnv === 'production' 
      ? 'https://peakhive-backend.vercel.app/api' 
      : 'http://localhost:5000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent long-running requests
  timeout: 15000
});

// Generate a unique session ID for this tab if it doesn't exist
if (!window.sessionStorage.getItem('tabSessionId')) {
  const tabSessionId = 'tab_' + Math.random().toString(36).substring(2, 15);
  window.sessionStorage.setItem('tabSessionId', tabSessionId);
}

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get the tab-specific session ID
    const tabSessionId = window.sessionStorage.getItem('tabSessionId') || 'default_tab';
    
    // Try to get user info from session storage first (tab-specific)
    let userInfo = window.sessionStorage.getItem(`userInfo_${tabSessionId}`);
    
    // If not in session storage, fall back to localStorage (shared between tabs)
    if (!userInfo) {
      userInfo = localStorage.getItem('userInfo');
      // If found in localStorage, also save to this tab's session storage for future requests
      if (userInfo) {
        window.sessionStorage.setItem(`userInfo_${tabSessionId}`, userInfo);
      }
    }
    
    const isProfileRequest = config.url && (
      config.url.includes('/users/profile') || 
      config.url.endsWith('/profile')
    );
    
    // Enhanced debug for profile requests
    if (isProfileRequest) {
      console.log('Making request to profile API:', config.url);
      console.log('User info in storage:', userInfo ? 'Present' : 'Not found');
    }
    
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        
        // Check for token in different possible locations
        const token = parsedUserInfo.token || 
                     (parsedUserInfo.user && parsedUserInfo.user.token) || 
                     '';
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          
          // Debug for profile request
          if (isProfileRequest) {
            console.log('Including auth token in profile request:', 
                      `Bearer ${token.substring(0, 10)}...`);
            console.log('Token length:', token.length);
          }
        } else {
          // Debug for profile request
          if (isProfileRequest) {
            console.error('No token found in user info object');
            console.log('User info structure:', Object.keys(parsedUserInfo));
            console.log('User info sample:', JSON.stringify({
              id: parsedUserInfo._id || 'none',
              firstName: parsedUserInfo.firstName || 'none',
              role: parsedUserInfo.role || 'none'
            }));
          }
        }
      } catch (error) {
        console.error('Error parsing user info in request interceptor:', error);
        
        // Only clear on parse errors (corrupted data)
        if (error instanceof SyntaxError) {
          console.log('Clearing corrupted user info from storage');
          window.sessionStorage.removeItem(`userInfo_${tabSessionId}`);
          localStorage.removeItem('userInfo');
        }
      }
    } else {
      // Debug for profile request
      if (isProfileRequest) {
        console.warn('No user info found for profile request');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const tabSessionId = window.sessionStorage.getItem('tabSessionId') || 'default_tab';
    
    // If no config exists, or we've already retried, reject
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // If it's a network error, show a specific message for connection issues
    if (error.message === 'Network Error') {
      console.error('Network connection error - Please check your internet connection');
      // Return a more specific error that UI can display
      return Promise.reject({
        ...error,
        response: {
          data: {
            message: 'Cannot connect to the server. Please check your internet connection.'
          }
        }
      });
    }
    
    // If request timed out (MongoDB connection timeout would cause this)
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - Database or server might be overloaded');
      return Promise.reject({
        ...error,
        response: {
          data: {
            message: 'Request timed out. The server or database might be unavailable.'
          }
        }
      });
    }
    
    // Handle token expiration
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - only clear this tab's session
      window.sessionStorage.removeItem(`userInfo_${tabSessionId}`);
      // Optionally clear localStorage if this was the main user
      if (!document.hidden) {
        localStorage.removeItem('userInfo');
      }
      
      // Only redirect if this is the active tab
      if (!document.hidden) {
        window.location.href = '/login?expired=true';
      }
      
      return Promise.reject(error);
    }
    
    // Handle forbidden access
    if (error.response && error.response.status === 403) {
      // User doesn't have permission
      console.error('Forbidden access:', error.response.data);
      
      // Only redirect if this is the active tab
      if (!document.hidden) {
        window.location.href = '/';
      }
      
      return Promise.reject(error);
    }
    
    // Retry request for certain status codes (except auth-related ones)
    if (error.response && [408, 429, 500, 502, 503, 504].includes(error.response.status)) {
      console.log(`Retrying request to ${originalRequest.url} due to ${error.response.status} error`);
      
      // Mark as retry attempt
      originalRequest._retry = true;
      
      // Delay and retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api(originalRequest);
    }
    
    // Handle server errors
    if (error.response && error.response.status === 500) {
      console.error('Server error:', error);
      // Add logging or analytics here for monitoring server errors
    }
    
    return Promise.reject(error);
  }
);

export default api; 