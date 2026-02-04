
import axios from 'axios';
import config from '../config';
import { getStorage } from '../utils/storage';

const http = axios.create({
  baseURL: config.API.BASE_URL,
});

http.interceptors.request.use(
  (axiosConfig) => {
    const token = getStorage(config.API.TOKEN_NAME);
    if (token) {
      axiosConfig.headers.Authorization = `Bearer ${token}`;
    }
    return axiosConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    // This is a mock refresh token logic as per the manual's example
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Token expired, attempting to refresh...');
      // In a real app, you would call your refresh token endpoint here
      // const { data } = await http.post('/auth/refresh');
      // saveStorage(config.API.TOKEN_NAME, data.token);
      // return http(originalRequest);
      alert('Session expired. Please log in again.');
      window.location.href = '/#/login'; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export default http;
