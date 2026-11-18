import type { CollectionType } from '@/components/dify/tools/types'
import type { ResourceVarInputs } from '@/components/dify/workflow/nodes/_base/types'
import type { CommonNodeType } from '@/components/dify/workflow/types'

export type PluginTriggerNodeType = CommonNodeType & {
  provider_id: string
  provider_type: CollectionType
  provider_name: string
  event_name: string
  event_label: string
  event_parameters: ResourceVarInputs
  event_configurations: Record<string, any>
  output_schema: Record<string, any>
  parameters_schema?: Record<string, any>[]
  version?: string
  event_node_version?: string
  plugin_id?: string
  config?: Record<string, any>
  plugin_unique_identifier?: string
}
