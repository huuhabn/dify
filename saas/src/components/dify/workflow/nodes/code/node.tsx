import type { FC } from 'react'
import type { CodeNodeType } from './types'
import type { NodeProps } from '@/components/dify/workflow/types'
import * as React from 'react'

const Node: FC<NodeProps<CodeNodeType>> = () => {
  return (
    // No summary content
    <div></div>
  )
}

export default React.memo(Node)
