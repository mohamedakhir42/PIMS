import api from './api';
import { User } from '../types';

export const usersService = {
  list: async () => (await api.get('/users')).data,
  create: async (payload: unknown) => (await api.post('/users', payload)).data,
  update: async (id: string, payload: unknown) => (await api.patch(`/users/${id}`, payload)).data,
  disable: async (id: string) => (await api.delete(`/users/${id}`)).data,
  roles: async () => (await api.get('/roles')).data,
  permissions: async () => (await api.get('/roles/permissions')).data,

  async uploadAvatar(id: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<User>(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteAvatar(id: string): Promise<User> {
    const response = await api.delete<User>(`/users/${id}/avatar`);
    return response.data;
  },
};
