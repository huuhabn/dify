import type { KnowledgeBaseNodeType } from '@/components/dify/workflow/nodes/knowledge-base/types'
import { useTranslation } from 'react-i18next'
import { START_INITIAL_POSITION } from '@/components/dify/workflow/constants'
import knowledgeBaseDefault from '@/components/dify/workflow/nodes/knowledge-base/default'
import { generateNewNode } from '@/components/dify/workflow/utils'

export const usePipelineTemplate = () => {
  const { t } = useTranslation(['workflow'])

  const { newNode: knowledgeBaseNode } = generateNewNode({
    id: 'knowledgeBase',
    data: {
      ...(knowledgeBaseDefault.defaultValue as KnowledgeBaseNodeType),
      type: knowledgeBaseDefault.metaData.type,
      title: t(($) => $[`blocks.${knowledgeBaseDefault.metaData.type}`], { ns: 'workflow' }),
      selected: true,
    },
    position: {
      x: START_INITIAL_POSITION.x + 500,
      y: START_INITIAL_POSITION.y,
    },
  })

  return {
    nodes: [knowledgeBaseNode],
    edges: [],
  }
}
