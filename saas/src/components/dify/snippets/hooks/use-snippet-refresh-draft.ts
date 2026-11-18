import type { WorkflowDataUpdater } from '@/components/dify/workflow/types'
import type { InputVar } from '@/types/dify/pipeline'
import type { SnippetWorkflow } from '@/types/snippet'
import { useCallback } from 'react'
import { useWorkflowUpdate } from '@/components/dify/workflow/hooks/use-workflow-update'
import { useWorkflowStore } from '@/components/dify/workflow/store'
import { fetchSnippetDraftWorkflow } from '@/service/use-snippet-workflows'
import { useSnippetDraftStore } from '../draft-store/index'

export const useSnippetRefreshDraft = (snippetId: string) => {
  const workflowStore = useWorkflowStore()
  const { handleUpdateWorkflowCanvas } = useWorkflowUpdate()

  const handleRefreshWorkflowDraft = useCallback(
    (onSuccess?: (draftWorkflow: SnippetWorkflow) => void) => {
      const { setDraftUpdatedAt, setIsSyncingWorkflowDraft, setSyncWorkflowDraftHash } =
        workflowStore.getState()

      if (!snippetId) return

      setIsSyncingWorkflowDraft(true)
      fetchSnippetDraftWorkflow(snippetId)
        .then((response) => {
          if (!response) return

          const inputFields = Array.isArray(response.input_fields)
            ? (response.input_fields as InputVar[])
            : []

          handleUpdateWorkflowCanvas({
            ...response.graph,
            nodes: response.graph?.nodes || [],
            edges: response.graph?.edges || [],
            viewport: response.graph?.viewport || { x: 0, y: 0, zoom: 1 },
          } as WorkflowDataUpdater)
          useSnippetDraftStore.setState({
            inputFields,
          })
          setSyncWorkflowDraftHash(response.hash)
          setDraftUpdatedAt(response.updated_at)
          onSuccess?.(response)
        })
        .finally(() => {
          setIsSyncingWorkflowDraft(false)
        })
    },
    [handleUpdateWorkflowCanvas, snippetId, workflowStore],
  )

  return {
    handleRefreshWorkflowDraft,
  }
}
