import api from '../../../services/axios';

export const getMyEmployer = async () => {
  const { data } = await api.get('/employers/me');
  return data;
};

export const updateMyEmployer = async (body) => {
  const { data } = await api.patch('/employers/me', body);
  return data;
};

export const listEmployers = async (status) => {
  const { data } = await api.get('/admin/employers', { params: status ? { status } : {} });
  return data;
};

export const verifyEmployer = async (id, body) => {
  const { data } = await api.patch(`/admin/employers/${id}/verify`, body);
  return data;
};
