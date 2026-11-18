import { request } from './api-client';
import type { AppDetail, AppMode, AppTemplate, CreateAppRequest, UpdateAppRequest } from '@/types/dify/app';

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

  async listRecommendedApps(category?: string): Promise<{ categories: string[]; recommended_apps: AppTemplate[] }> {
    const res = await request<{
      categories?: string[];
      recommended_apps?: Array<{
        app?: {
          id: string;
          name?: string;
          mode?: AppMode;
          icon?: string;
          icon_background?: string;
        };
        app_id?: string;
        id?: string;
        name?: string;
        description?: string;
        category?: string;
        categories?: string[];
        copyright?: string;
        author?: string;
        mode?: AppMode;
        icon?: string;
        icon_background?: string;
      }>;
    }>('/console/api/explore/apps', {
      params: category && category !== 'all' ? { category } : undefined,
    });

    const normalizedApps: AppTemplate[] = (res?.recommended_apps || []).map((item) => ({
      id: item.app?.id || item.app_id || item.id || '',
      name: item.app?.name || item.name || 'Untitled App',
      description: item.description || '',
      mode: item.app?.mode || item.mode || 'chat',
      icon: item.app?.icon || item.icon || '🤖',
      icon_background: item.app?.icon_background || item.icon_background || '#EFF6FF',
      category: item.categories?.[0] || item.category || 'all',
      author: item.copyright || item.author || 'Dify Community',
    }));

    return {
      categories: res?.categories || [],
      recommended_apps: normalizedApps,
    };
  },

  async installAppFromTemplate(app_id: string, name?: string): Promise<{ id: string; app: AppDetail }> {
    return request('/console/api/explore/installed-apps', {
      method: 'POST',
      body: {
        app_id,
        name,
      },
    });
  },
};
