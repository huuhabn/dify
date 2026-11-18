import type { RAGPipelineVariable } from '@/types/dify/pipeline'
import { PipelineInputVarType } from '@/types/dify/pipeline'

export const createPipelineVariable = (
  overrides: Partial<RAGPipelineVariable> = {},
): RAGPipelineVariable => ({
  belong_to_node_id: 'source-node',
  type: PipelineInputVarType.textInput,
  variable: 'source',
  label: 'Source',
  required: true,
  default_value: '',
  max_length: 256,
  placeholder: 'Enter source',
  tooltips: '',
  options: [],
  ...overrides,
})
