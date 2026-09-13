import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const payload = error.response?.data;
    const message = payload?.message || error.message || 'Request failed';
    const nextError = new Error(message);
    nextError.payload = payload;
    nextError.status = error.response?.status;
    return Promise.reject(nextError);
  }
);

export default api;
