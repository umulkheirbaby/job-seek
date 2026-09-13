import api from '../../../services/axios';

export const getMyProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateMyProfile = async (body) => {
  const { data } = await api.patch('/profile', body);
  return data;
};
