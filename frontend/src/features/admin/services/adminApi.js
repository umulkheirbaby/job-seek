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

export const listAdminApplications = async (status) => {
  const { data } = await api.get('/admin/applications', { params: status ? { status } : {} });
  return data;
};
