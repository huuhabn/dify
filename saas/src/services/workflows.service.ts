import { request } from './api-client';
import type { WorkflowConfig, WorkflowRunResult } from '@/types/dify/workflow';

export const WorkflowsService = {
  async get(appId: string): Promise<WorkflowConfig> {
    return request<WorkflowConfig>(`/console/api/apps/${appId}/workflows/draft`);
  },

  async syncDraft(appId: string, graph: WorkflowConfig['graph']): Promise<WorkflowConfig> {
    return request<WorkflowConfig>(`/console/api/apps/${appId}/workflows/draft`, {
      method: 'POST',
      body: { graph },
    });
  },

  async publish(appId: string): Promise<{ created_at: number }> {
    return request<{ created_at: number }>(`/console/api/apps/${appId}/workflows/publish`, {
      method: 'POST',
    });
  },

  async run(appId: string, inputs: Record<string, unknown> = {}): Promise<WorkflowRunResult> {
    return request<WorkflowRunResult>(`/console/api/apps/${appId}/workflows/draft/run`, {
      method: 'POST',
      body: { inputs },
    });
  },
};
