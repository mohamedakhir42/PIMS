import api from './api';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  site_id: string;
  manager?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseCreate {
  code: string;
  name: string;
  site_id: string;
  manager?: string;
  description?: string;
  status: string;
}

export interface WarehouseUpdate {
  name?: string;
  manager?: string;
  description?: string;
  status?: string;
}

export const warehousesService = {
  async getWarehouses() {
    const response = await api.get<Warehouse[]>('/warehouses');
    return response.data;
  },

  async getWarehouse(id: string) {
    const response = await api.get<Warehouse>(`/warehouses/${id}`);
    return response.data;
  },

  async createWarehouse(data: WarehouseCreate) {
    const response = await api.post<Warehouse>('/warehouses', data);
    return response.data;
  },

  async updateWarehouse(id: string, data: WarehouseUpdate) {
    const response = await api.patch<Warehouse>(`/warehouses/${id}`, data);
    return response.data;
  },
};
