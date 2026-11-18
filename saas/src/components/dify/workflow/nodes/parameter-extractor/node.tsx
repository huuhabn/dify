import type { FC } from 'react'
import type { ParameterExtractorNodeType } from './types'
import type { NodeProps } from '@/components/dify/workflow/types'
import * as React from 'react'
import { useTextGenerationCurrentProviderAndModelAndModelList } from '@/components/dify/header/account-setting/model-provider-page/hooks'
import { ModelSelector } from '@/components/dify/header/account-setting/model-provider-page/model-selector'

const Node: FC<NodeProps<ParameterExtractorNodeType>> = ({ data }) => {
  const { provider, name: modelId } = data.model || {}
  const { textGenerationModelList } = useTextGenerationCurrentProviderAndModelAndModelList()
  const hasSetModel = provider && modelId
  return (
    <div className="mb-1 px-3 py-1">
      {hasSetModel && (
        <ModelSelector
          value={{ provider, model: modelId }}
          models={textGenerationModelList}
          size="small"
          disabled
        />
      )}
    </div>
  )
}

export default React.memo(Node)
