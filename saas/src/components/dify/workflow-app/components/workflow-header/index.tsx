import type { HeaderProps } from '@/components/dify/workflow/header'
import { useAtomValue } from 'jotai'
import { memo, useCallback, useMemo } from 'react'
import {
  isChatflowAtom,
  workflowAppIdentityAtom,
} from '@/components/dify/workflow/editor-resource/state'
import Header from '@/components/dify/workflow/header'
import { useStore } from '@/components/dify/workflow/store'
import { useResetWorkflowVersionHistory } from '@/service/use-workflow'
import ChatVariableTrigger from './chat-variable-trigger'
import FeaturesTrigger from './features-trigger'

const WorkflowHeader = () => {
  const { appId } = useAtomValue(workflowAppIdentityAtom)
  const setMessageLogItem = useStore((state) => state.setMessageLogItem)
  const resetWorkflowVersionHistory = useResetWorkflowVersionHistory()
  const isChatflow = useAtomValue(isChatflowAtom)

  const handleClearLogAndMessageModal = useCallback(() => {
    setMessageLogItem(undefined)
  }, [setMessageLogItem])

  const viewHistoryProps = useMemo(() => {
    return {
      onClearLogAndMessageModal: handleClearLogAndMessageModal,
      historyUrl: isChatflow
        ? `/apps/${appId}/advanced-chat/workflow-runs`
        : `/apps/${appId}/workflow-runs`,
    }
  }, [appId, isChatflow, handleClearLogAndMessageModal])

  const headerProps: HeaderProps = useMemo(() => {
    return {
      normal: {
        components: {
          middle: <FeaturesTrigger />,
          chatVariableTrigger: <ChatVariableTrigger />,
        },
        runAndHistoryProps: {
          showRunButton: !isChatflow,
          showPreviewButton: isChatflow,
          viewHistoryProps,
        },
      },
      viewHistory: {
        viewHistoryProps,
      },
      restoring: {
        onRestoreSettled: resetWorkflowVersionHistory,
      },
    }
  }, [resetWorkflowVersionHistory, isChatflow, viewHistoryProps])
  return <Header {...headerProps} />
}

export default memo(WorkflowHeader)
