'use client'
import type { FC } from 'react'
import type { WorkflowVariableBlockType } from '@/components/dify/base/prompt-editor/types'
import * as React from 'react'
import { useEffect } from 'react'
import PromptEditor from '@/components/dify/base/prompt-editor'

type Props = Readonly<{
  value: string
  workflowVariableBlock: WorkflowVariableBlockType
}>

const keyIdPrefix = 'prompt-res-editor'
const PromptRes: FC<Props> = ({ value, workflowVariableBlock }) => {
  const [editorKey, setEditorKey] = React.useState<string>('keyIdPrefix-0')
  useEffect(() => {
    setEditorKey(`${keyIdPrefix}-${Date.now()}`)
  }, [value])
  return (
    <PromptEditor
      key={editorKey}
      value={value}
      editable={false}
      className="h-full bg-transparent pt-0"
      workflowVariableBlock={workflowVariableBlock}
    />
  )
}
export default React.memo(PromptRes)
