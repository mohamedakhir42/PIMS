import api from './api';

export const requestsService = {
  list: async (params?: Record<string, string>) => (await api.get('/requests', { params })).data,
  get: async (id: string) => (await api.get(`/requests/${id}`)).data,
  create: async (payload: unknown) => (await api.post('/requests', payload)).data,
  update: async (id: string, payload: unknown) => (await api.patch(`/requests/${id}`, payload)).data,
  submit: async (id: string) => (await api.post(`/requests/${id}/submit`)).data,
  cancel: async (id: string) => (await api.post(`/requests/${id}/cancel`)).data,
  approve: async (id: string) => (await api.post(`/requests/${id}/approve`)).data,
  reject: async (id: string, reason: string) => (await api.post(`/requests/${id}/reject`, { rejection_reason: reason })).data,
  issue: async (id: string, data: { location_id: string; warehouse_id: string; site_id: string }) => (await api.post(`/requests/${id}/issue`, data)).data,
};
