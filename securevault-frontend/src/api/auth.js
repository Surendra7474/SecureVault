import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  verifyPin: (pin) => api.post('/auth/verify-pin', { pin }),
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
  logout: () => api.post('/auth/logout'),
};
