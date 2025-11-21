import axios from 'axios';
import { BASE_URL } from '../assets/url';

// Get token from localStorage with error handling for tracking prevention
const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    // Handle cases where localStorage access is blocked (e.g., Edge tracking prevention)
    // This is non-critical as cookies are also used for authentication
    if (error.name === 'SecurityError' || error.name === 'QuotaExceededError') {
      console.warn('localStorage access blocked, using cookie-based authentication only');
    }
    return null;
  }
};

// Configure default axios instance
axios.defaults.baseURL = BASE_URL;
axios.defaults.withCredentials = true;

// Request interceptor - automatically attach token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // Add Authorization header if token exists
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ensure withCredentials is set for all requests
    if (config.withCredentials === undefined) {
      config.withCredentials = true;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle 401 errors and suppress 404 console logs for product lookups
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Note: 404 errors for product lookups are expected when searching across multiple collections
    // The browser will still show these in the network tab, but we handle them gracefully in the code
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Special handling for endpoints that are expected to return 401 when user is not logged in
      // Don't reject the promise, let the component handle it with validateStatus
      const requestUrl = error.config?.url || error.config?.baseURL + error.config?.url || '';
      if (requestUrl.includes('/user/refetch') || requestUrl.includes('user/refetch') ||
          requestUrl.includes('/wish/mywishlist') || requestUrl.includes('wish/mywishlist')) {
        // Return a resolved promise with the error response so validateStatus can handle it
        // This prevents the error from being logged to console and redirecting
        return Promise.resolve({
          ...error.response,
          status: 401,
          data: error.response?.data || { message: 'Unauthorized' }
        });
      }
      
      // Clear any stored token
      try {
        localStorage.removeItem('token');
      } catch (error) {
        // Ignore localStorage errors (e.g., tracking prevention blocking access)
      }
      
      const currentPath = window.location.pathname;
      
      // Don't redirect if already on these pages
      const excludedRoutes = [
        '/signin', 
        '/register', 
        '/unauthenticated',
        '/',
        '/about',
        '/contact',
        '/cart' // Allow cart page for unauthenticated users (they can see localStorage items)
      ];
      
      // Check if current path starts with any excluded route
      const isExcluded = excludedRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
      );
      
      // Check if it's a public product route
      const publicRoutes = ['/product', '/products', '/offerProduct', '/featuredProduct', '/onlineProduct'];
      const isPublicRoute = publicRoutes.some(route => 
        currentPath.startsWith(route)
      );
      
      // Only redirect if not on excluded routes and not on public routes
      if (!isExcluded && !isPublicRoute) {
        // Use setTimeout to avoid conflicts with React Router navigation
        setTimeout(() => {
          // Only redirect if we're still on the same path (React Router might have navigated)
          if (window.location.pathname === currentPath) {
            window.location.href = '/unauthenticated';
          }
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

// Export default axios (now configured)
export default axios;

