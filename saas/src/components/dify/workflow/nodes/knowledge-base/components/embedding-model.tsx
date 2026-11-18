import type { DefaultModel } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import { useQuery } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  MultimodalRetrievalGuidance,
  MultimodalRetrievalGuidanceLearnMore,
} from '@/components/dify/datasets/common/multimodal-retrieval-guidance'
import { ModelTypeEnum } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import { ModelSelector } from '@/components/dify/header/account-setting/model-provider-page/model-selector'
import { Field } from '@/components/dify/workflow/nodes/_base/components/layout'
import { consoleQuery } from '@/service/console'

type EmbeddingModelProps = {
  embeddingModel?: string
  embeddingModelProvider?: string
  onEmbeddingModelChange?: (model: {
    embeddingModel: string
    embeddingModelProvider: string
  }) => void
  warningDot?: boolean
  readonly?: boolean
}
const EmbeddingModel = ({
  embeddingModel,
  embeddingModelProvider,
  onEmbeddingModelChange,
  warningDot = false,
  readonly = false,
}: EmbeddingModelProps) => {
  const { t } = useTranslation(['datasetSettings'])
  const { data: embeddingModelList = [] } = useQuery(
    consoleQuery.workspaces.current.models.modelTypes.byModelType.get.queryOptions({
      input: { params: { model_type: ModelTypeEnum.textEmbedding } },
      select: (response) => response.data,
    }),
  )
  const embeddingModelConfig = useMemo(() => {
    if (!embeddingModel || !embeddingModelProvider) return undefined

    return {
      providerName: embeddingModelProvider,
      modelName: embeddingModel,
    }
  }, [embeddingModel, embeddingModelProvider])

  const handleEmbeddingModelChange = useCallback(
    (model: DefaultModel) => {
      onEmbeddingModelChange?.({
        embeddingModelProvider: model.provider,
        embeddingModel: model.model,
      })
    },
    [onEmbeddingModelChange],
  )

  return (
    <Field
      fieldTitleProps={{
        title: t(($) => $['form.embeddingModel'], { ns: 'datasetSettings' }),
        subTitle: <MultimodalRetrievalGuidanceLearnMore />,
        warningDot,
      }}
    >
      <MultimodalRetrievalGuidance
        variant="pipeline"
        embeddingModel={
          embeddingModelConfig && {
            provider: embeddingModelConfig.providerName,
            model: embeddingModelConfig.modelName,
          }
        }
        embeddingModelList={embeddingModelList}
        className="mb-2"
      />
      <ModelSelector
        value={
          embeddingModelConfig && {
            provider: embeddingModelConfig.providerName,
            model: embeddingModelConfig.modelName,
          }
        }
        models={embeddingModelList}
        onValueChange={handleEmbeddingModelChange}
        disabled={readonly}
        showDeprecatedWarnIcon
      />
    </Field>
  )
}
export default memo(EmbeddingModel)
