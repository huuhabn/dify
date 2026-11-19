import { queryOptions } from '@tanstack/react-query';
import { toolsService } from './service';

export const toolsQueries = {
  providers: () =>
    queryOptions({
      queryKey: ['tools', 'providers'],
      queryFn: () => toolsService.getProviders(),
      staleTime: 5 * 60 * 1000
    }),

  plugins: () =>
    queryOptions({
      queryKey: ['tools', 'plugins'],
      queryFn: () => toolsService.getPlugins(),
      staleTime: 5 * 60 * 1000
    })
};
