import type { Datasource } from '@/components/dify/rag-pipeline/components/panel/test-run/types'
import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import type { Node } from '@/components/dify/workflow/types'
import { useCallback, useEffect } from 'react'
import { useDatasourceOptions } from '../hooks/index'
import OptionCard from './option-card'

type DataSourceOptionsProps = {
  pipelineNodes: Node<DataSourceNodeType>[]
  datasourceNodeId: string
  onSelect: (option: Datasource) => void
}

const DataSourceOptions = ({
  pipelineNodes,
  datasourceNodeId,
  onSelect,
}: DataSourceOptionsProps) => {
  const options = useDatasourceOptions(pipelineNodes)

  const handelSelect = useCallback(
    (value: string) => {
      const selectedOption = options.find((option) => option.value === value)
      if (!selectedOption) return
      const datasource = {
        nodeId: selectedOption.value,
        nodeData: selectedOption.data,
      }
      onSelect(datasource)
    },
    [onSelect, options],
  )

  useEffect(() => {
    if (options.length > 0 && !datasourceNodeId) handelSelect(options[0]!.value)
  }, [])

  return (
    <div className="grid w-full grid-cols-4 gap-1">
      {options.map((option) => (
        <OptionCard
          key={option.value}
          label={option.label}
          selected={datasourceNodeId === option.value}
          nodeData={option.data}
          onClick={handelSelect.bind(null, option.value)}
        />
      ))}
    </div>
  )
}

export default DataSourceOptions
