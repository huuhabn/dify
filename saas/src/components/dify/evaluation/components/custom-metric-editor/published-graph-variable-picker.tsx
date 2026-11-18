'use client'

import type { EditorResource } from '@/components/dify/workflow/editor-resource/resource'
import type { EndNodeType } from '@/components/dify/workflow/nodes/end/types'
import type {
  ConversationVariable,
  Edge,
  EnvironmentVariable,
  Node,
  ValueSelector,
} from '@/components/dify/workflow/types'
import { useMemo } from 'react'
import ReactFlow, { ReactFlowProvider } from 'reactflow'
import { WorkflowContext } from '@/components/dify/workflow/context'
import { EditorResourceScope } from '@/components/dify/workflow/editor-resource/provider'
import { createHooksStore, HooksStoreContext } from '@/components/dify/workflow/hooks-store'
import VarReferencePicker from '@/components/dify/workflow/nodes/_base/components/variable/var-reference-picker'
import { createWorkflowStore } from '@/components/dify/workflow/store/workflow'
import { BlockEnum } from '@/components/dify/workflow/types'
import { variableTransformer } from '@/components/dify/workflow/utils/variable'

type PublishedGraphVariablePickerProps = {
  className?: string
  resource: EditorResource
  nodes: Node[]
  edges: Edge[]
  environmentVariables?: EnvironmentVariable[]
  conversationVariables?: ConversationVariable[]
  placeholder: string
  value: string | null
  onChange: (value: string | null) => void
}

const PICKER_NODE_ID = '__evaluation-variable-picker__'

const createPickerNode = (): Node<EndNodeType> => ({
  id: PICKER_NODE_ID,
  type: 'custom',
  position: { x: 0, y: 0 },
  data: {
    type: BlockEnum.End,
    title: 'End',
    desc: '',
    outputs: [],
  },
})

const PublishedGraphVariablePicker = ({
  className,
  resource,
  nodes,
  edges,
  environmentVariables = [],
  conversationVariables = [],
  placeholder,
  value,
  onChange,
}: PublishedGraphVariablePickerProps) => {
  const workflowStore = useMemo(() => {
    const store = createWorkflowStore({})
    store.setState({
      isWorkflowDataLoaded: true,
      environmentVariables,
      conversationVariables,
      ragPipelineVariables: [],
      dataSourceList: [],
    })
    return store
  }, [conversationVariables, environmentVariables])

  const hooksStore = useMemo(() => createHooksStore({}), [])

  const pickerNodes = useMemo(() => {
    return [...nodes, createPickerNode()]
  }, [nodes])

  const pickerValue = useMemo<ValueSelector>(() => {
    if (!value) return []

    return variableTransformer(value) as ValueSelector
  }, [value])

  return (
    <EditorResourceScope resource={resource}>
      <WorkflowContext value={workflowStore}>
        <HooksStoreContext value={hooksStore}>
          <div id="workflow-container" className={className}>
            <ReactFlowProvider>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
              >
                <div style={{ width: 800, height: 600 }}>
                  <ReactFlow nodes={pickerNodes} edges={edges} fitView />
                </div>
              </div>

              <VarReferencePicker
                className="grow"
                nodeId={PICKER_NODE_ID}
                readonly={!nodes.length}
                isShowNodeName
                value={pickerValue}
                onChange={(nextValue) => {
                  if (!Array.isArray(nextValue) || !nextValue.length) {
                    onChange(null)
                    return
                  }

                  onChange(nextValue.join('.'))
                }}
                availableNodes={nodes}
                placeholder={placeholder}
              />
            </ReactFlowProvider>
          </div>
        </HooksStoreContext>
      </WorkflowContext>
    </EditorResourceScope>
  )
}

export default PublishedGraphVariablePicker
