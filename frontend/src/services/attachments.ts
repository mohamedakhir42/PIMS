import api from './api';

export const attachmentsService = {
  list: async (entityType?: string, entityId?: string) => {
    const params = new URLSearchParams();
    if (entityType) params.append('entity_type', entityType);
    if (entityId) params.append('entity_id', entityId);
    const response = await api.get(`/attachments?${params.toString()}`);
    return response.data;
  },

  get: async (id: string) => {
    const response = await api.get(`/attachments/${id}`);
    return response.data;
  },

  upload: async (entityType: string, entityId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    const response = await api.post('/attachments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/attachments/${id}`);
    return response.data;
  },
};
