import api from './api';

export const notificationsService = {
  list: async () => (await api.get('/notifications')).data,
  getAll: async () => (await api.get('/notifications')).data,
  markAsRead: async (id: string) => (await api.patch(`/notifications/${id}`, { status: 'READ' })).data,
};