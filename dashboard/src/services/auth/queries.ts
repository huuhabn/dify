import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { authService } from './service';
import type { LoginPayload, SetupPayload } from './types';

export const authQueries = {
  initValidate: () =>
    queryOptions({
      queryKey: ['auth', 'initValidate'],
      queryFn: authService.getInitValidate,
      staleTime: 10 * 60 * 1000
    }),

  currentUser: () =>
    queryOptions({
      queryKey: ['auth', 'currentUser'],
      queryFn: authService.getCurrentUser,
      staleTime: 5 * 60 * 1000
    }),

  workspaces: () =>
    queryOptions({
      queryKey: ['auth', 'workspaces'],
      queryFn: authService.getWorkspaces,
      staleTime: 5 * 60 * 1000
    })
};

export const authMutations = {
  login: mutationOptions({
    mutationFn: (payload: LoginPayload) => authService.login(payload)
  }),

  logout: mutationOptions({
    mutationFn: () => authService.logout()
  }),

  setup: mutationOptions({
    mutationFn: (payload: SetupPayload) => authService.setup(payload)
  }),

  switchWorkspace: mutationOptions({
    mutationFn: (workspaceId: string) => authService.switchWorkspace(workspaceId)
  }),

  sendForgotPasswordEmail: mutationOptions({
    mutationFn: ({ email, language }: { email: string; language?: string }) =>
      authService.sendForgotPasswordEmail(email, language)
  }),

  checkForgotPasswordCode: mutationOptions({
    mutationFn: (payload: { email: string; code: string; token: string }) =>
      authService.checkForgotPasswordCode(payload)
  }),

  resetPassword: mutationOptions({
    mutationFn: (payload: { token: string; new_password: string; password_confirm: string }) =>
      authService.resetPassword(payload)
  })
};
