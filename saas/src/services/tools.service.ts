import { request } from './api-client';
import type { ModelProvider } from '@/types/dify/model-provider';

export type BuiltInToolProvider = {
  id: string;
  name: string;
  author?: string;
  label: Record<string, string>;
  description: Record<string, string>;
  icon: string | { background?: string; content?: string };
  type: string;
  tools?: Array<{
    name: string;
    label: Record<string, string>;
    description: Record<string, string>;
    parameters?: Array<{
      name: string;
      label: Record<string, string>;
      type: string;
      required: boolean;
    }>;
  }>;
};

export type ApiToolProvider = {
  id: string;
  name: string;
  author?: string;
  label: Record<string, string>;
  description: Record<string, string>;
  icon: { background?: string; content?: string } | string;
  type: string;
  allow_delete?: boolean;
  tools?: Array<{
    name: string;
    label: Record<string, string>;
    description: Record<string, string>;
  }>;
};

export type CreateCustomToolPayload = {
  provider: string;
  icon?: { background: string; content: string };
  credentials?: Record<string, unknown>;
  schema_type?: 'openapi' | 'swagger';
  schema: string;
  privacy_policy?: string;
  custom_disclaimer?: string;
  labels?: string[];
};

export const ToolsService = {
  async listModelProviders(): Promise<{ data: ModelProvider[] }> {
    return request<{ data: ModelProvider[] }>('/console/api/workspaces/current/model-providers');
  },

  async saveModelProviderCredentials(
    provider: string,
    credentials: Record<string, unknown>,
    name?: string,
  ): Promise<void> {
    return request<void>(`/console/api/workspaces/current/model-providers/${provider}/credentials`, {
      method: 'POST',
      body: {
        credentials,
        name: name || `${provider}-credentials`,
      },
    });
  },

  async listBuiltInTools(): Promise<BuiltInToolProvider[]> {
    return request<BuiltInToolProvider[]>('/console/api/workspaces/current/tools/builtin');
  },

  async listCustomTools(): Promise<ApiToolProvider[]> {
    return request<ApiToolProvider[]>('/console/api/workspaces/current/tools/api');
  },

  async createCustomTool(data: CreateCustomToolPayload): Promise<{ result: string }> {
    return request<{ result: string }>('/console/api/workspaces/current/tool-provider/api/add', {
      method: 'POST',
      body: {
        provider: data.provider,
        icon: data.icon || { background: '#2563EB', content: '🔧' },
        credentials: data.credentials || { auth_type: 'none' },
        schema_type: data.schema_type || 'openapi',
        schema: data.schema,
        privacy_policy: data.privacy_policy || '',
        custom_disclaimer: data.custom_disclaimer || '',
        labels: data.labels || [],
      },
    });
  },

  async deleteCustomTool(provider: string): Promise<{ result: string }> {
    return request<{ result: string }>('/console/api/workspaces/current/tool-provider/api/delete', {
      method: 'POST',
      body: { provider },
    });
  },
};
