import api from './api';

export const inventoriesService = {
  list: async () => (await api.get('/inventories')).data,
  get: async (id: string) => (await api.get(`/inventories/${id}`)).data,
  create: async (payload: unknown) => (await api.post('/inventories', payload)).data,
  updateItem: async (inventoryId: string, itemId: string, physical_quantity: number) =>
    (await api.patch(`/inventories/${inventoryId}/items/${itemId}`, { physical_quantity })).data,
  validate: async (id: string) => (await api.post(`/inventories/${id}/validate`)).data,
};
