import api from './axios';

export const vaultApi = {
  getAll: (search) => api.get('/vault', { params: search ? { search } : {} }),
  getById: (id) => api.get(`/vault/${id}`),
  create: (data) => api.post('/vault', data),
  update: (id, data) => api.put(`/vault/${id}`, data),
  delete: (id) => api.delete(`/vault/${id}`),
  verifyItemPin: (id, pin) => api.post(`/vault/${id}/verify-item-pin`, { pin }),
  reveal: (id) => api.post(`/vault/${id}/reveal`),
  copy: (id) => api.post(`/vault/${id}/copy`),
  share: (id, email) => api.post(`/vault/${id}/share`, { email }),
  generatePassword: () => api.get('/vault/generate-password'),
};
