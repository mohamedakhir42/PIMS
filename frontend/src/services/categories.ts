import api from './api';
import { Category } from '../types';

export const categoryService = {
  async getCategories(skip = 0, limit = 100): Promise<Category[]> {
    const response = await api.get<Category[]>(`/categories?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getCategory(id: string): Promise<Category> {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(category: Partial<Category>): Promise<Category> {
    const response = await api.post<Category>('/categories', category);
    return response.data;
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const response = await api.patch<Category>(`/categories/${id}`, category);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
