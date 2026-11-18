export type WorkflowNodeType =
  | 'start'
  | 'end'
  | 'llm'
  | 'knowledge-retrieval'
  | 'code'
  | 'if-else'
  | 'http-request'
  | 'tool'
  | 'template-transform'
  | 'variable-assigner';

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  title: string;
  desc?: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
  selected?: boolean;
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

export type WorkflowConfig = {
  id?: string;
  graph: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    viewport?: { x: number; y: number; zoom: number };
  };
  features?: {
    file_upload?: boolean;
    text_to_speech?: boolean;
  };
  hash?: string;
  created_at?: number;
  updated_at?: number;
};

export type NodeExecutionState = {
  nodeId: string;
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  error?: string;
  elapsed_time?: number;
  total_tokens?: number;
};

export type WorkflowRunResult = {
  run_id: string;
  status: 'running' | 'succeeded' | 'failed' | 'stopped';
  outputs?: Record<string, unknown>;
  error?: string;
  elapsed_time?: number;
  total_tokens?: number;
  steps?: NodeExecutionState[];
};
