import { consoleApiClient } from '../client';
import { encryptPassword } from '@/lib/encryption';
import type {
  CurrentUser,
  InitValidateResponse,
  LoginPayload,
  LoginResponse,
  SetupPayload,
  WorkspacesResponse
} from './types';

export const authService = {
  getInitValidate: () =>
    consoleApiClient<InitValidateResponse>('/init', {
      method: 'GET',
      skipAuth: true
    }),

  setup: (payload: SetupPayload) =>
    consoleApiClient<{ result: 'success' }>('/setup', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    }),

  login: (payload: LoginPayload) =>
    consoleApiClient<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        password: payload.password ? encryptPassword(payload.password) : undefined,
        remember_me: payload.remember_me ?? true
      }),
      skipAuth: true
    }),

  logout: () =>
    consoleApiClient<{ result: 'success' }>('/logout', {
      method: 'GET'
    }),

  refreshToken: (refreshToken: string) =>
    consoleApiClient<LoginResponse>('/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
      skipAuth: true
    }),

  getCurrentUser: () =>
    consoleApiClient<CurrentUser>('/account/profile', {
      method: 'GET'
    }),

  getWorkspaces: () =>
    consoleApiClient<WorkspacesResponse>('/workspaces', {
      method: 'GET'
    }),

  switchWorkspace: (workspaceId: string) =>
    consoleApiClient<{ result: 'success' }>('/workspaces/switch', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: workspaceId })
    })
};
