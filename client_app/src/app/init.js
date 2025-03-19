import axios from 'axios';
import { toast } from 'react-toastify';

//let VITE_REACT_APP_BASE_URL = 'http://localhost:5000';

let VITE_REACT_APP_BASE_URL = 'https://intern-trail-backend.onrender.com';

export const initializeApp = () => {
  console.log(import.meta.env);
  // Setting base URL for all API request via axios

  const TOKEN = localStorage.getItem('token');

  axios.defaults.headers.common['Authorization'] = `Bearer ${TOKEN}`;

  axios.interceptors.request.use(
    function (config) {
      // UPDATE: Add this code to show global loading indicator
      document.body.classList.add('loading-indicator');
      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    function (response) {
      // UPDATE: Add this code to hide global loading indicator
      document.body.classList.remove('loading-indicator');
      return response;
    },
    function (error) {
      document.body.classList.remove('loading-indicator');

      console.log('Dex');
      const publicRoutes = [
        'login',
        'register',
        'user-selection',
        'account-creation'
      ];

      console.log({ publicRoutes, error: error.config.url.includes('dex') });
      const isPublicRoute = publicRoutes.some(route =>
        error.config.url.includes(route)
      );

      console.log({ isPublicRoute });

      if (
        !isPublicRoute &&
        error.response &&
        error.response.data.error === 'Invalid token'
      ) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  axios.defaults.baseURL = `${VITE_REACT_APP_BASE_URL}/api`;

  console.log({ api: VITE_REACT_APP_BASE_URL });
};
