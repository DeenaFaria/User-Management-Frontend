import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000', // Your backend API base URL
});

// Axios interceptor to handle blocked or unauthorized users
api.interceptors.response.use(
  (response) => {
    return response; // Return the response if no error
  },
  (error) => {
    // If the server returns 403 or 401, redirect to login
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      alert(error.response.data.message || 'Access denied, redirecting to login.');
      
      // Force redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error); // Return the error if it's not handled
  }
);

export default api; // Export this Axios instance for use in your components
