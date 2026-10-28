import api from '../../../services/axios';

export const getAdminDashboard = async () => {
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const listUsers = async ({ role, status, search } = {}) => {
  const params = {};
  if (role) {
    params.role = role;
  }
  if (status) {
    params.status = status;
  }
  if (search) {
    params.search = search;
  }

  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const updateUserStatus = async (id, status) => {
  const { data } = await api.patch(`/admin/users/${id}/status`, { status });
  return data;
};

export const listJobSeekers = async (status) => {
  const { data } = await api.get('/admin/job-seekers', { params: status ? { status } : {} });
  return data;
};

export const verifyJobSeeker = async (id, body) => {
  const { data } = await api.patch(`/admin/job-seekers/${id}/verify`, body);
  return data;
};

export const openJobSeekerDocument = (id) => {
  const base = import.meta.env.VITE_API_URL || '/api/v1';
  window.open(`${base}/admin/job-seekers/${id}/document`, '_blank', 'noopener,noreferrer');
};

export const listAdminApplications = async (status) => {
  const { data } = await api.get('/admin/applications', { params: status ? { status } : {} });
  return data;
};
