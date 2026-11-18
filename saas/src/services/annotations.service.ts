import { request } from './api-client';
import type { AnnotationItem, AnnotationListResponse } from '@/types/dify/annotation';

export const AnnotationsService = {
  async list(appId: string, page = 1, limit = 20): Promise<AnnotationListResponse> {
    try {
      return await request<AnnotationListResponse>(`/console/api/apps/${appId}/annotations`, {
        params: { page, limit },
      });
    } catch {
      return { data: [], total: 0, page: 1, limit: 20, has_more: false };
    }
  },

  async create(appId: string, question: string, answer: string): Promise<AnnotationItem> {
    return request<AnnotationItem>(`/console/api/apps/${appId}/annotations`, {
      method: 'POST',
      body: { question, answer },
    });
  },

  async update(appId: string, annotationId: string, question: string, answer: string): Promise<AnnotationItem> {
    return request<AnnotationItem>(`/console/api/apps/${appId}/annotations/${annotationId}`, {
      method: 'POST',
      body: { question, answer },
    });
  },

  async delete(appId: string, annotationId: string): Promise<void> {
    return request<void>(`/console/api/apps/${appId}/annotations/${annotationId}`, {
      method: 'DELETE',
    });
  },

  async getCount(appId: string): Promise<{ count: number }> {
    try {
      return await request<{ count: number }>(`/console/api/apps/${appId}/annotations/count`);
    } catch {
      return { count: 0 };
    }
  },
};
