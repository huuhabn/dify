import type { DatasetDetailWithPartialMembersResponse } from '@dify/contracts/api/console/datasets/types.gen'
import type { ComponentProps } from 'react'
import type AppPublisher from '@/components/dify/app/app-publisher/features-wrapper'
import type { ModelAndParameter } from '@/components/dify/app/configuration/debug/types'
import type {
  Features as FeaturesData,
  OnFeaturesChange,
} from '@/components/dify/base/features/types'
import type { FormValue } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import type ModelParameterModal from '@/components/dify/header/account-setting/model-provider-page/model-parameter-modal'
import type ConfigContext from '@/context/debug-configuration'
import type { ModelConfig, PromptVariable } from '@/types/dify/debug'

export type DebugConfigurationValue = ComponentProps<typeof ConfigContext.Provider>['value']

export type ConfigurationViewModel = {
  appPublisherProps: ComponentProps<typeof AppPublisher>
  contextValue: DebugConfigurationValue
  featuresData: FeaturesData
  isAgent: boolean
  isAdvancedMode: boolean
  isBelowSm: boolean
  isShowDebugPanel: boolean
  isShowHistoryModal: boolean
  isShowSelectDataSet: boolean
  modelConfig: ModelConfig
  multipleModelConfigs: ModelAndParameter[]
  onAutoAddPromptVariable: (variables: PromptVariable[]) => void
  onAgentSettingChange: (config: ModelConfig['agentConfig']) => void
  onCloseFeaturePanel: () => void
  onCloseHistoryModal: () => void
  onCloseSelectDataSet: () => void
  onCompletionParamsChange: (params: FormValue) => void
  onConfirmUseGPT4: () => void
  onEnableMultipleModelDebug: () => void
  onFeaturesChange: OnFeaturesChange
  onHideDebugPanel: () => void
  onModelChange: ComponentProps<typeof ModelParameterModal>['setModel']
  onMultipleModelConfigsChange: (multiple: boolean, modelConfigs: ModelAndParameter[]) => void
  onOpenAccountSettings: () => void
  onOpenDebugPanel: () => void
  onSaveHistory: (
    data: DebugConfigurationValue['completionPromptConfig']['conversation_histories_role'],
  ) => void
  onSelectDataSets: (data: DatasetDetailWithPartialMembersResponse[]) => void
  promptVariables: PromptVariable[]
  selectedIds: string[]
  showAppConfigureFeaturesModal: boolean
  showLoading: boolean
  showUseGPT4Confirm: boolean
  setShowUseGPT4Confirm: (visible: boolean) => void
}
