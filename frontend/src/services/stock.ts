import api from './api';
import { Stock, StockMovement } from '../types';

export const stockService = {
  async getStock(skip = 0, limit = 100): Promise<Stock[]> {
    const response = await api.get<Stock[]>(`/stock?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getCriticalStock(): Promise<Stock[]> {
    const response = await api.get<Stock[]>('/stock/critical');
    return response.data;
  },

  async getMovements(skip = 0, limit = 100): Promise<StockMovement[]> {
    const response = await api.get<StockMovement[]>(`/stock/movements?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async createReceipt(movement: Partial<StockMovement>): Promise<StockMovement> {
    const response = await api.post<StockMovement>('/stock/receipt', movement);
    return response.data;
  },

  async createIssue(movement: Partial<StockMovement>): Promise<StockMovement> {
    const response = await api.post<StockMovement>('/stock/issue', movement);
    return response.data;
  },

  async createTransfer(movement: Partial<StockMovement>): Promise<StockMovement> {
    const response = await api.post<StockMovement>('/stock/transfer', movement);
    return response.data;
  },

  async createAdjustment(movement: Partial<StockMovement>): Promise<StockMovement> {
    const response = await api.post<StockMovement>('/stock/adjustment', movement);
    return response.data;
  },
};
