import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { appsService } from './service';
import type { CreateAppPayload } from './types';

export const appQueries = {
  list: (params?: { page?: number; limit?: number; name?: string; mode?: string }) =>
    queryOptions({
      queryKey: ['apps', 'list', params],
      queryFn: () => appsService.getApps(params),
      staleTime: 60 * 1000
    }),

  detail: (appId: string) =>
    queryOptions({
      queryKey: ['apps', 'detail', appId],
      queryFn: () => appsService.getAppDetail(appId),
      enabled: !!appId,
      staleTime: 60 * 1000
    })
};

export const appMutations = {
  create: mutationOptions({
    mutationFn: (payload: CreateAppPayload) => appsService.createApp(payload)
  }),

  update: mutationOptions({
    mutationFn: ({ appId, payload }: { appId: string; payload: Partial<CreateAppPayload> }) =>
      appsService.updateApp(appId, payload)
  }),

  delete: mutationOptions({
    mutationFn: (appId: string) => appsService.deleteApp(appId)
  }),

  copy: mutationOptions({
    mutationFn: ({ appId, payload }: { appId: string; payload: { name: string; description?: string } }) =>
      appsService.copyApp(appId, payload)
  })
};
