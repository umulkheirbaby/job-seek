import api from '../../../services/axios';

export const register = async (body) => {
  const { data } = await api.post('/auth/register', body);
  return data;
};

export const login = async (body) => {
  const { data } = await api.post('/auth/login', body);
  return data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
