import { consoleApiClient } from '../client';
import type { PluginItem, ToolProvider } from './types';

export const toolsService = {
  getProviders: () =>
    consoleApiClient<ToolProvider[]>('/workspaces/current/tool-providers', {
      method: 'GET'
    }),

  getPlugins: () =>
    consoleApiClient<PluginItem[]>('/marketplace/plugins', {
      method: 'GET'
    })
};
