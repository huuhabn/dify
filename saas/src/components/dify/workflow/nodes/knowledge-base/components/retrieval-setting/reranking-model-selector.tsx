import type { RerankingModel } from '../../types'
import type { DefaultModel } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import { memo, useMemo } from 'react'
import { ModelTypeEnum } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import { useModelListAndDefaultModel } from '@/components/dify/header/account-setting/model-provider-page/hooks'
import { ModelSelector } from '@/components/dify/header/account-setting/model-provider-page/model-selector'

export type RerankingModelSelectorProps = {
  rerankingModel?: RerankingModel
  onRerankingModelChange?: (model: RerankingModel) => void
  readonly?: boolean
}
const RerankingModelSelector = ({
  rerankingModel,
  onRerankingModelChange,
  readonly = false,
}: RerankingModelSelectorProps) => {
  const { modelList: rerankModelList } = useModelListAndDefaultModel(ModelTypeEnum.rerank)
  const rerankModel = useMemo(() => {
    if (!rerankingModel?.reranking_provider_name || !rerankingModel?.reranking_model_name)
      return undefined

    return {
      provider: rerankingModel.reranking_provider_name,
      model: rerankingModel.reranking_model_name,
    }
  }, [rerankingModel])

  const handleRerankingModelChange = (model: DefaultModel) => {
    onRerankingModelChange?.({
      reranking_provider_name: model.provider,
      reranking_model_name: model.model,
    })
  }

  return (
    <ModelSelector
      value={rerankModel}
      models={rerankModelList}
      onValueChange={handleRerankingModelChange}
      disabled={readonly}
      showDeprecatedWarnIcon
    />
  )
}

export default memo(RerankingModelSelector)
