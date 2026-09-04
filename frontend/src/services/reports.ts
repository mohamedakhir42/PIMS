import api from './api';

export const reportsService = {
  dashboard: async () => (await api.get('/reports/dashboard')).data,
  stock: async () => (await api.get('/reports/stock')).data,
  movements: async (params?: Record<string, string>) => (await api.get('/reports/movements', { params })).data,
  critical: async () => (await api.get('/reports/critical-stock')).data,
  inventory: async () => (await api.get('/reports/inventory')).data,
};
