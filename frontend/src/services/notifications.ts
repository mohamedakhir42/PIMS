import api from './api';

export const notificationsService = {
  getAll: async () => {
    return (await api.get('/notifications')).data;
  },

  markAsRead: async (id: string) => {
    return (
      await api.patch(`/notifications/${id}/read`, {
        is_read: true,
      })
    ).data;
  },
};