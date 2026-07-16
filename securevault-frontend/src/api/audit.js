import api from './axios';

export const auditApi = {
  getAll: () => api.get('/audit'),
  getByItem: (vaultItemId) => api.get(`/audit/item/${vaultItemId}`),
};
