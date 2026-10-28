import api from '../../../services/axios';

export const applyToJob = async (jobId, { coverLetter } = {}) => {
  const { data } = await api.post(`/jobs/${jobId}/apply`, { coverLetter: coverLetter || '' });
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

export const openApplicationDocument = async (id) => {
  const base = import.meta.env.VITE_API_URL || '/api/v1';
  if (typeof window !== 'undefined' && String(base).startsWith('/')) {
    window.open(`${base}/applications/${id}/document`, '_blank', 'noopener,noreferrer');
    return;
  }

  const response = await api.get(`/applications/${id}/document`, { responseType: 'blob' });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};
