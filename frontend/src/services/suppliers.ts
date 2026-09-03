import api from './api';
import { Supplier } from '../types';

export const supplierService = {
  async getSuppliers(skip = 0, limit = 100): Promise<Supplier[]> {
    const response = await api.get<Supplier[]>(`/suppliers?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getSupplier(id: string): Promise<Supplier> {
    const response = await api.get<Supplier>(`/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await api.post<Supplier>('/suppliers', supplier);
    return response.data;
  },

  async updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
    const response = await api.patch<Supplier>(`/suppliers/${id}`, supplier);
    return response.data;
  },
};
