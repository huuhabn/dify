import type { AppType } from '@/components/dify/apps/app-type'
import type { FormValue } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import type { DatasetConfigs, ModelConfig, PromptMode } from '@/types/dify/debug'

export type ConfigurationAppMode = Extract<AppType, 'chat' | 'agent-chat' | 'completion'>

export type ConfigurationPublishConfig = {
  modelConfig: ModelConfig
  completionParams: FormValue
  promptMode: PromptMode
  chatPromptConfig: NonNullable<ModelConfig['chat_prompt_config']>
  completionPromptConfig: NonNullable<ModelConfig['completion_prompt_config']>
  datasetConfigs: DatasetConfigs
  externalDataToolsConfig: NonNullable<ModelConfig['external_data_tools']>
}
