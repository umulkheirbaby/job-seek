import api from '../../../services/axios';

const apiBase = () => import.meta.env.VITE_API_URL || '/api/v1';

export const getMyProfile = async () => {
  const { data } = await api.get('/profile');
  return data;
};

export const updateMyProfile = async (body) => {
  const { data } = await api.patch('/profile', body);
  return data;
};

export const uploadProfileDocuments = async (files) => {
  const form = new FormData();
  files.forEach((file) => form.append('documents', file));
  const { data } = await api.post('/profile/document', form);
  return data;
};

export const openProfileDocument = () => {
  const base = apiBase();
  if (typeof window !== 'undefined' && String(base).startsWith('/')) {
    window.open(`${base}/profile/document`, '_blank', 'noopener,noreferrer');
    return;
  }

  return api.get('/profile/document', { responseType: 'blob' }).then((response) => {
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });
};
