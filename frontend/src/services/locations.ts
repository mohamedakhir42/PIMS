import api from './api';

export interface Location {
  id: string;
  code: string;
  name: string;
  zone_id: string;
  capacity?: number;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocationCreate {
  code: string;
  name: string;
  zone_id: string;
  capacity?: number;
  description?: string;
  status: string;
}

export interface LocationUpdate {
  name?: string;
  capacity?: number;
  description?: string;
  status?: string;
}

export const locationsService = {
  async getLocations() {
    const response = await api.get<Location[]>('/locations');
    return response.data;
  },

  async getLocation(id: string) {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  },

  async createLocation(data: LocationCreate) {
    const response = await api.post<Location>('/locations', data);
    return response.data;
  },

  async updateLocation(id: string, data: LocationUpdate) {
    const response = await api.patch<Location>(`/locations/${id}`, data);
    return response.data;
  },
};
