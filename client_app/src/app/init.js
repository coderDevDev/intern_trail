import axios from 'axios';

let VITE_REACT_APP_BASE_URL = 'http://localhost:5000';

const initializeApp = () => {
  console.log(import.meta.env);
  // Setting base URL for all API request via axios
  axios.defaults.baseURL = `${VITE_REACT_APP_BASE_URL}/api`;

  console.log({ api: VITE_REACT_APP_BASE_URL });
};

export default initializeApp;
