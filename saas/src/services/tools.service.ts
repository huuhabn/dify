import { request } from './api-client';
import type { ModelProvider, ProviderCredential } from '@/types/dify/model-provider';

export type BuiltInTool = {
  name: string;
  label: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  parameters: Array<{
    name: string;
    label: Record<string, string>;
    type: string;
    required: boolean;
  }>;
};

export const ToolsService = {
  async listModelProviders(): Promise<{ data: ModelProvider[] }> {
    return request<{ data: ModelProvider[] }>('/console/api/workspaces/current/model-providers');
  },

  async saveModelProviderCredentials(data: ProviderCredential): Promise<void> {
    return request<void>(`/console/api/workspaces/current/model-providers/${data.provider}`, {
      method: 'POST',
      body: data.credentials,
    });
  },

  async listBuiltInTools(): Promise<BuiltInTool[]> {
    return request<BuiltInTool[]>('/console/api/workspaces/current/tools/builtin');
  },

  async createCustomTool(data: {
    name: string;
    schema: string;
    credentials?: Record<string, unknown>;
  }): Promise<{ id: string }> {
    return request<{ id: string }>('/console/api/workspaces/current/tools/api', {
      method: 'POST',
      body: data,
    });
  },
};
