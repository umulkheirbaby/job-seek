import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }
  return config;
});

const readErrorPayload = async (data) => {
  if (!data) {
    return undefined;
  }

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try {
      return JSON.parse(await data.text());
    } catch {
      return undefined;
    }
  }

  return data;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const payload = await readErrorPayload(error.response?.data);
    const message = payload?.message || error.message || 'Request failed';
    const nextError = new Error(message);
    nextError.payload = payload;
    nextError.status = error.response?.status;
    return Promise.reject(nextError);
  }
);

export default api;
