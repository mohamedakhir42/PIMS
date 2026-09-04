import api from './api';

export const usersService = {
  list: async () => (await api.get('/users')).data,
  create: async (payload: unknown) => (await api.post('/users', payload)).data,
  update: async (id: string, payload: unknown) => (await api.patch(`/users/${id}`, payload)).data,
  disable: async (id: string) => (await api.delete(`/users/${id}`)).data,
  roles: async () => (await api.get('/roles')).data,
  permissions: async () => (await api.get('/roles/permissions')).data,
};
