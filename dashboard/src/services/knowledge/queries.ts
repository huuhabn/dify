import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { knowledgeService } from './service';
import type { CreateDatasetPayload } from './types';

export const knowledgeQueries = {
  list: (params?: { page?: number; limit?: number; keyword?: string }) =>
    queryOptions({
      queryKey: ['knowledge', 'list', params],
      queryFn: () => knowledgeService.getDatasets(params),
      staleTime: 60 * 1000
    }),

  detail: (datasetId: string) =>
    queryOptions({
      queryKey: ['knowledge', 'detail', datasetId],
      queryFn: () => knowledgeService.getDatasetDetail(datasetId),
      enabled: !!datasetId,
      staleTime: 60 * 1000
    }),

  documents: (datasetId: string, params?: { page?: number; limit?: number; keyword?: string }) =>
    queryOptions({
      queryKey: ['knowledge', 'documents', datasetId, params],
      queryFn: () => knowledgeService.getDocuments(datasetId, params),
      enabled: !!datasetId,
      staleTime: 60 * 1000
    })
};

export const knowledgeMutations = {
  create: mutationOptions({
    mutationFn: (payload: CreateDatasetPayload) => knowledgeService.createDataset(payload)
  }),

  delete: mutationOptions({
    mutationFn: (datasetId: string) => knowledgeService.deleteDataset(datasetId)
  })
};
