import api from '../../../services/axios';

export const listJobs = async (params) => {
  const { data } = await api.get('/jobs', { params });
  return data;
};

export const getJob = async (id) => {
  const { data } = await api.get(`/jobs/${id}`);
  return data;
};

export const listMyJobs = async () => {
  const { data } = await api.get('/jobs/mine');
  return data;
};

export const createJob = async (body) => {
  const { data } = await api.post('/jobs', body);
  return data;
};

export const updateJob = async (id, body) => {
  const { data } = await api.patch(`/jobs/${id}`, body);
  return data;
};

export const removeJob = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`);
  return data;
};

export const listAdminJobs = async (status) => {
  const { data } = await api.get('/admin/jobs', { params: status ? { status } : {} });
  return data;
};

export const reviewJob = async (id, body) => {
  const { data } = await api.patch(`/admin/jobs/${id}/approve`, body);
  return data;
};
