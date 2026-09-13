import api from '../../../services/axios';

export const applyToJob = async (jobId, body) => {
  const { data } = await api.post(`/jobs/${jobId}/apply`, body);
  return data;
};

export const getMyApplicationForJob = async (jobId) => {
  const { data } = await api.get(`/jobs/${jobId}/my-application`);
  return data;
};

export const listApplications = async () => {
  const { data } = await api.get('/applications');
  return data;
};

export const listJobApplications = async (jobId) => {
  const { data } = await api.get(`/jobs/${jobId}/applications`);
  return data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.patch(`/applications/${id}/status`, { status });
  return data;
};
