import { request } from './api-client';
import type { AppDetail, CreateAppRequest, UpdateAppRequest } from '@/types/dify/app';

export type AppsListResponse = {
  data: AppDetail[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export const AppsService = {
  async list(page = 1, limit = 30, mode?: string): Promise<AppsListResponse> {
    return request<AppsListResponse>('/console/api/apps', {
      params: { page, limit, mode },
    });
  },

  async get(id: string): Promise<AppDetail> {
    return request<AppDetail>(`/console/api/apps/${id}`);
  },

  async create(data: CreateAppRequest): Promise<AppDetail> {
    return request<AppDetail>('/console/api/apps', {
      method: 'POST',
      body: data,
    });
  },

  async update(id: string, data: UpdateAppRequest): Promise<AppDetail> {
    return request<AppDetail>(`/console/api/apps/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/console/api/apps/${id}`, {
      method: 'DELETE',
    });
  },

  async sendChatMessage(
    appId: string,
    query: string,
    inputs: Record<string, unknown> = {},
    conversationId?: string,
  ): Promise<{ message_id: string; conversation_id: string; answer: string }> {
    return request(`/console/api/apps/${appId}/chat-messages`, {
      method: 'POST',
      body: {
        query,
        inputs,
        response_mode: 'blocking',
        conversation_id: conversationId,
      },
    });
  },
};
