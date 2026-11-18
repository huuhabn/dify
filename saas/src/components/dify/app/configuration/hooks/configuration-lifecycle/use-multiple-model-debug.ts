import type { FormValue } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import type { ModelConfig } from '@/types/dify/debug'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { useDebugWithSingleOrMultipleModel } from '@/components/dify/app/configuration/debug/hooks'
import { setDetailSidebarModeAtom } from '@/components/dify/detail-sidebar/state'

export function useMultipleModelDebug({
  appId,
  completionParams,
  modelConfig,
}: {
  appId: string
  completionParams: FormValue
  modelConfig: ModelConfig
}) {
  const setDetailSidebarMode = useSetAtom(setDetailSidebarModeAtom)
  const { debugWithMultipleModel, multipleModelConfigs, handleMultipleModelConfigsChange } =
    useDebugWithSingleOrMultipleModel(appId)
  const enableMultipleModelDebug = useCallback(() => {
    handleMultipleModelConfigsChange(true, [
      {
        id: `${Date.now()}`,
        model: modelConfig.model_id,
        provider: modelConfig.provider,
        parameters: completionParams,
      },
      { id: `${Date.now()}-no-repeat`, model: '', provider: '', parameters: {} },
    ])
    setDetailSidebarMode('collapse')
  }, [
    completionParams,
    handleMultipleModelConfigsChange,
    modelConfig.model_id,
    modelConfig.provider,
    setDetailSidebarMode,
  ])

  return {
    debugWithMultipleModel,
    enableMultipleModelDebug,
    handleMultipleModelConfigsChange,
    multipleModelConfigs,
  }
}
