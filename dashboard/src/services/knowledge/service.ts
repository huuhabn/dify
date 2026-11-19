import { consoleApiClient } from '../client';
import type { CreateDatasetPayload, Dataset, DatasetListResponse, DocumentListResponse } from './types';

export const knowledgeService = {
  getDatasets: (params?: { page?: number; limit?: number; keyword?: string }) =>
    consoleApiClient<DatasetListResponse>('/datasets', {
      method: 'GET',
      params
    }),

  getDatasetDetail: (datasetId: string) =>
    consoleApiClient<Dataset>(`/datasets/${datasetId}`, {
      method: 'GET'
    }),

  createDataset: (payload: CreateDatasetPayload) =>
    consoleApiClient<Dataset>('/datasets', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  deleteDataset: (datasetId: string) =>
    consoleApiClient<{ result: 'success' }>(`/datasets/${datasetId}`, {
      method: 'DELETE'
    }),

  getDocuments: (datasetId: string, params?: { page?: number; limit?: number; keyword?: string }) =>
    consoleApiClient<DocumentListResponse>(`/datasets/${datasetId}/documents`, {
      method: 'GET',
      params
    })
};
