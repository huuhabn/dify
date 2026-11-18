import type { SnippetDraftRunPayload } from '@/types/snippet'
import { useCallback } from 'react'
import { useWorkflowInteractions } from '@/components/dify/workflow/hooks/use-workflow-panel-interactions'
import { useWorkflowStore } from '@/components/dify/workflow/store'
import { WorkflowRunningStatus } from '@/components/dify/workflow/types'
import { useSnippetDraftStore } from '../draft-store/index'

type UseSnippetStartRunOptions = {
  handleRun: (params: SnippetDraftRunPayload) => void
}

export const useSnippetStartRun = ({ handleRun }: UseSnippetStartRunOptions) => {
  const workflowStore = useWorkflowStore()
  const { handleCancelDebugAndPreviewPanel } = useWorkflowInteractions()

  const handleWorkflowStartRunInWorkflow = useCallback(() => {
    const {
      workflowRunningData,
      showDebugAndPreviewPanel,
      setShowDebugAndPreviewPanel,
      setShowInputsPanel,
      setShowEnvPanel,
      setShowGlobalVariablePanel,
    } = workflowStore.getState()

    if (workflowRunningData?.result.status === WorkflowRunningStatus.Running) return

    setShowEnvPanel(false)
    setShowGlobalVariablePanel(false)

    if (showDebugAndPreviewPanel) {
      handleCancelDebugAndPreviewPanel()
      return
    }

    setShowDebugAndPreviewPanel(true)

    const currentInputFields = useSnippetDraftStore.getState().inputFields

    if (currentInputFields.length > 0) {
      setShowInputsPanel(true)
      return
    }

    setShowInputsPanel(false)
    handleRun({ inputs: {} })
  }, [handleCancelDebugAndPreviewPanel, handleRun, workflowStore])

  const handleStartWorkflowRun = useCallback(() => {
    handleWorkflowStartRunInWorkflow()
  }, [handleWorkflowStartRunInWorkflow])

  return {
    handleStartWorkflowRun,
    handleWorkflowStartRunInWorkflow,
  }
}
