import { consoleApiClient } from '../client';
import type { App, AppDetailResponse, AppListResponse, CreateAppPayload } from './types';

export const appsService = {
  getApps: (params?: { page?: number; limit?: number; name?: string; mode?: string }) =>
    consoleApiClient<AppListResponse>('/apps', {
      method: 'GET',
      params
    }),

  getAppDetail: (appId: string) =>
    consoleApiClient<AppDetailResponse>(`/apps/${appId}`, {
      method: 'GET'
    }),

  createApp: (payload: CreateAppPayload) =>
    consoleApiClient<App>('/apps', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateApp: (appId: string, payload: Partial<CreateAppPayload>) =>
    consoleApiClient<App>(`/apps/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deleteApp: (appId: string) =>
    consoleApiClient<{ result: 'success' }>(`/apps/${appId}`, {
      method: 'DELETE'
    }),

  copyApp: (appId: string, payload: { name: string; description?: string }) =>
    consoleApiClient<App>(`/apps/${appId}/copy`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
