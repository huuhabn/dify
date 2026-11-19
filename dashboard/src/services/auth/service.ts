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
    }),

  sendForgotPasswordEmail: (email: string, language: string = 'en-US') =>
    consoleApiClient<{ result: 'success'; data: string }>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, language }),
      skipAuth: true
    }),

  checkForgotPasswordCode: (payload: { email: string; code: string; token: string }) =>
    consoleApiClient<{ is_valid: boolean; email: string; token: string }>('/forgot-password/validity', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    }),

  resetPassword: (payload: { token: string; new_password: string; password_confirm: string }) =>
    consoleApiClient<{ result: 'success' }>('/forgot-password/resets', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuth: true
    })
};
