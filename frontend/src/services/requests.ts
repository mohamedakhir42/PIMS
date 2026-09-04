import api from './api';

export const requestsService = {
  list: async (params?: Record<string, string>) => (await api.get('/requests', { params })).data,
  get: async (id: string) => (await api.get(`/requests/${id}`)).data,
  create: async (payload: unknown) => (await api.post('/requests', payload)).data,
  update: async (id: string, payload: unknown) => (await api.patch(`/requests/${id}`, payload)).data,
  approve: async (id: string) => (await api.post(`/requests/${id}/approve`)).data,
  reject: async (id: string, reason: string) => (await api.post(`/requests/${id}/reject`, { rejection_reason: reason })).data,
};
