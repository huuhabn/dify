import type { DataSourceOption } from '@/components/dify/rag-pipeline/components/panel/test-run/types'
import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import type { Node } from '@/components/dify/workflow/types'
import { useMemo } from 'react'
import { BlockEnum } from '@/components/dify/workflow/types'

/**
 * Hook for getting datasource options from pipeline nodes
 */
export const useDatasourceOptions = (pipelineNodes: Node<DataSourceNodeType>[]) => {
  const datasourceNodes = pipelineNodes.filter((node) => node.data.type === BlockEnum.DataSource)

  const options = useMemo(() => {
    const options: DataSourceOption[] = []
    datasourceNodes.forEach((node) => {
      const label = node.data.title
      options.push({
        label,
        value: node.id,
        data: node.data,
      })
    })
    return options
  }, [datasourceNodes])

  return options
}
