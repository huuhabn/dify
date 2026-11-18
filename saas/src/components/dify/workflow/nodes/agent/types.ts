import type { AgentStrategyEntity, Meta } from '@dify/contracts/api/console/workspaces/types.gen'
import type { ResourceVarInputs } from '@/components/dify/workflow/nodes/_base/types'
import type { CommonNodeType, Memory } from '@/components/dify/workflow/types'

export type AgentNodeType = CommonNodeType & {
  agent_strategy_provider_name?: string
  agent_strategy_name?: string
  agent_strategy_label?: string
  agent_parameters?: ResourceVarInputs
  meta?: Meta
  output_schema: AgentStrategyEntity['output_schema']
  plugin_unique_identifier?: string
  memory?: Memory
  version?: string
  tool_node_version?: string
}
