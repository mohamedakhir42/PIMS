import api from './api';

export interface Zone {
  id: string;
  code: string;
  name: string;
  warehouse_id: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ZoneCreate {
  code: string;
  name: string;
  warehouse_id: string;
  description?: string;
  status: string;
}

export interface ZoneUpdate {
  name?: string;
  description?: string;
  status?: string;
}

export const zonesService = {
  async getZones() {
    const response = await api.get<Zone[]>('/zones');
    return response.data;
  },

  async getZone(id: string) {
    const response = await api.get<Zone>(`/zones/${id}`);
    return response.data;
  },

  async createZone(data: ZoneCreate) {
    const response = await api.post<Zone>('/zones', data);
    return response.data;
  },

  async updateZone(id: string, data: ZoneUpdate) {
    const response = await api.patch<Zone>(`/zones/${id}`, data);
    return response.data;
  },
};
