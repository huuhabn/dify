import type { SyncDraftCallback } from '../hooks-store'
import { useCallback } from 'react'
import { useHooksStore } from '@/components/dify/workflow/hooks-store'
import { useStore } from '../store'
import { useNodesReadOnly } from './use-workflow'

export const useNodesSyncDraft = () => {
  const { getNodesReadOnly } = useNodesReadOnly()
  const debouncedSyncWorkflowDraft = useStore((s) => s.debouncedSyncWorkflowDraft)
  const doSyncWorkflowDraft = useHooksStore((s) => s.doSyncWorkflowDraft)
  const syncWorkflowDraftWhenPageClose = useHooksStore((s) => s.syncWorkflowDraftWhenPageClose)

  const handleSyncWorkflowDraft = useCallback(
    (sync?: boolean, notRefreshWhenSyncError?: boolean, callback?: SyncDraftCallback) => {
      if (getNodesReadOnly()) return

      if (sync) return doSyncWorkflowDraft(notRefreshWhenSyncError, callback)

      debouncedSyncWorkflowDraft(doSyncWorkflowDraft)
    },
    [debouncedSyncWorkflowDraft, doSyncWorkflowDraft, getNodesReadOnly],
  )

  return {
    doSyncWorkflowDraft,
    handleSyncWorkflowDraft,
    syncWorkflowDraftWhenPageClose,
  }
}
