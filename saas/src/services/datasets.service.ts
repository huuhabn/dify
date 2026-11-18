import { request } from './api-client';
import type { Dataset, Document, HitTestingResponse } from '@/types/dify/dataset';

export type DatasetsListResponse = {
  data: Dataset[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
};

export type DocumentsListResponse = {
  data: Document[];
  total: number;
  page: number;
  limit: number;
};

export const DatasetsService = {
  async list(page = 1, limit = 30): Promise<DatasetsListResponse> {
    return request<DatasetsListResponse>('/console/api/datasets', {
      params: { page, limit },
    });
  },

  async get(id: string): Promise<Dataset> {
    return request<Dataset>(`/console/api/datasets/${id}`);
  },

  async create(name: string, description?: string): Promise<Dataset> {
    return request<Dataset>('/console/api/datasets', {
      method: 'POST',
      body: {
        name,
        description,
        permission: 'all_team_members',
        indexing_technique: 'high_quality',
      },
    });
  },

  async listDocuments(datasetId: string, page = 1, limit = 20): Promise<DocumentsListResponse> {
    return request<DocumentsListResponse>(`/console/api/datasets/${datasetId}/documents`, {
      params: { page, limit },
    });
  },

  async toggleDocument(datasetId: string, documentId: string, enable: boolean): Promise<void> {
    return request<void>(`/console/api/datasets/${datasetId}/documents/${documentId}/processing/${enable ? 'enable' : 'disable'}`, {
      method: 'PATCH',
    });
  },

  async hitTesting(datasetId: string, query: string, topK = 4): Promise<HitTestingResponse> {
    return request<HitTestingResponse>(`/console/api/datasets/${datasetId}/hit-testing`, {
      method: 'POST',
      body: {
        query,
        retrieval_model: {
          search_method: 'semantic_search',
          top_k: topK,
          score_threshold_enabled: false,
        },
      },
    });
  },
};
