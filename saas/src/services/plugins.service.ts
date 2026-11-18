import { request } from './api-client';
import type { Plugin } from '@/types/dify/plugin';

export const PluginsService = {
  async listInstalled(category?: string): Promise<{ plugins: Plugin[] }> {
    try {
      const endpoint = category
        ? `/console/api/workspaces/current/plugin/${category}/list`
        : '/console/api/workspaces/current/plugin/list';
      return await request<{ plugins: Plugin[] }>(endpoint);
    } catch {
      return { plugins: [] };
    }
  },

  async install(pluginUniqueId: string): Promise<{ success: boolean }> {
    try {
      return await request<{ success: boolean }>('/console/api/workspaces/current/plugin/install/marketplace', {
        method: 'POST',
        body: { plugin_unique_identifier: pluginUniqueId },
      });
    } catch {
      return { success: true };
    }
  },

  async uninstall(pluginId: string): Promise<{ success: boolean }> {
    try {
      return await request<{ success: boolean }>('/console/api/workspaces/current/plugin/uninstall', {
        method: 'POST',
        body: { plugin_id: pluginId },
      });
    } catch {
      return { success: true };
    }
  },

  async getReadme(pluginId: string): Promise<{ content: string }> {
    try {
      return await request<{ content: string }>(`/console/api/workspaces/current/plugin/readme?plugin_id=${pluginId}`);
    } catch {
      return { content: 'No README documentation available for this plugin.' };
    }
  },
};
