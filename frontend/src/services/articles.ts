import api from './api';
import { Article } from '../types';

export const articleService = {
  async getArticles(skip = 0, limit = 100): Promise<Article[]> {
    const response = await api.get<Article[]>(`/articles?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  async getArticle(id: string): Promise<Article> {
    const response = await api.get<Article>(`/articles/${id}`);
    return response.data;
  },

  async createArticle(article: Partial<Article>): Promise<Article> {
    const response = await api.post<Article>('/articles', article);
    return response.data;
  },

  async updateArticle(id: string, article: Partial<Article>): Promise<Article> {
    const response = await api.patch<Article>(`/articles/${id}`, article);
    return response.data;
  },
};
