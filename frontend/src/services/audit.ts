import api from './api';
export const auditService = {
  list: async (filters?: Record<string, string>) => (await api.get('/audit-logs', { params: filters })).data,
};
