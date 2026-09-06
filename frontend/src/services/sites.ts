import api from './api';

export interface Site {
  id: string;
  code: string;
  name: string;
  description?: string;
  address?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SiteCreate {
  code: string;
  name: string;
  description?: string;
  address?: string;
  status: string;
}

export interface SiteUpdate {
  name?: string;
  description?: string;
  address?: string;
  status?: string;
}

export const sitesService = {
  async getSites() {
    const response = await api.get<Site[]>('/sites');
    return response.data;
  },

  async getSite(id: string) {
    const response = await api.get<Site>(`/sites/${id}`);
    return response.data;
  },

  async createSite(data: SiteCreate) {
    const response = await api.post<Site>('/sites', data);
    return response.data;
  },

  async updateSite(id: string, data: SiteUpdate) {
    const response = await api.patch<Site>(`/sites/${id}`, data);
    return response.data;
  },
};
