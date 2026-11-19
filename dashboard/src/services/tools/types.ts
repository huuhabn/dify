export interface ToolProvider {
  id: string;
  name: string;
  label: string;
  description: string;
  icon: string;
  type: 'builtin' | 'api' | 'model';
  tools: ToolItem[];
}

export interface ToolItem {
  name: string;
  label: string;
  description: string;
  parameters: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
  }>;
}

export interface PluginItem {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  icon: string;
  verified: boolean;
  category: string;
  install_count: number;
}
