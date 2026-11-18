export type PluginCategory = 'tool' | 'model' | 'extension' | 'bundle';

export interface PluginDeclaration {
  name: string;
  author: string;
  version: string;
  description: Record<string, string> | string;
  icon?: string;
  category: PluginCategory;
  label?: Record<string, string> | string;
  tags?: string[];
  verified?: boolean;
}

export interface Plugin {
  id: string;
  plugin_id: string;
  plugin_unique_identifier: string;
  declaration: PluginDeclaration;
  source: 'marketplace' | 'github' | 'package';
  created_at: number;
  updated_at: number;
  installed?: boolean;
  version?: string;
}

export interface PluginListResponse {
  plugins: Plugin[];
  total?: number;
}
