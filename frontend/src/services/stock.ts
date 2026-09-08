import api from './api';

export const stockService = {
  getStock: async () => {
    const response = await api.get('/stock');
    return response.data;
  },

  getCriticalStock: async () => {
    const response = await api.get('/stock/critical');
    return response.data;
  },

  getMovements: async () => {
    const response = await api.get('/stock/movements');
    return response.data;
  },

  validateMovement: async (data: any) => {
    const response = await api.post('/stock/validate', data);
    return response.data;
  },

  createReceipt: async (data: any) => {
    const response = await api.post('/stock/receipt', {
      ...data,
      movement_type: 'RECEIPT',
    });
    return response.data;
  },

  createIssue: async (data: any) => {
    const response = await api.post('/stock/issue', {
      ...data,
      movement_type: 'ISSUE',
    });
    return response.data;
  },

  createTransfer: async (data: any) => {
    const response = await api.post('/stock/transfer', {
      ...data,
      movement_type: 'TRANSFER'
    });
    return response.data;
  },

  createReturn: async (data: any) => {
    const response = await api.post('/stock/return', {
      ...data,
      movement_type: 'RETURN',
    });
    return response.data;
  },

  createAdjustment: async (data: any) => {
    const response = await api.post('/stock/adjustment', {
      ...data,
      movement_type: 'ADJUSTMENT',
    });
    return response.data;
  },
};