// axiosService.js

import axios from 'axios';

// Create a default Axios instance
const axiosInstance = axios.create();

// Function to set the base URL dynamically
export const setBaseUrl = (baseUrl) => {
  axiosInstance.defaults.baseURL = baseUrl;
};

// Export the Axios instance
export default axiosInstance;
