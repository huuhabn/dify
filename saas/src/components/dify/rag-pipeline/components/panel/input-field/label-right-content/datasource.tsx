import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import * as React from 'react'
import BlockIcon from '@/components/dify/workflow/block-icon'
import { useToolIcon } from '@/components/dify/workflow/hooks/use-tool-icon'
import { BlockEnum } from '@/components/dify/workflow/types'

type DatasourceProps = {
  nodeData: DataSourceNodeType
}

const Datasource = ({ nodeData }: DatasourceProps) => {
  const toolIcon = useToolIcon(nodeData)

  return (
    <div className="flex items-center gap-x-1.5">
      <div className="flex size-5 items-center justify-center rounded-md border-[0.5px] border-components-panel-border-subtle bg-background-default">
        <BlockIcon className="size-3.5" type={BlockEnum.DataSource} toolIcon={toolIcon} />
      </div>
      <span className="system-sm-medium text-text-secondary">{nodeData.title}</span>
    </div>
  )
}

export default React.memo(Datasource)
