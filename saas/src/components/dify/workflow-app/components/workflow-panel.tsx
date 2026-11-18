import type { PanelProps } from '@/components/dify/workflow/panel'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import { memo, useMemo } from 'react'
import {
  isChatflowAtom,
  workflowAppIdentityAtom,
} from '@/components/dify/workflow/editor-resource/state'
import Panel from '@/components/dify/workflow/panel'
import CommentsPanel from '@/components/dify/workflow/panel/comments-panel'
import { useStore } from '@/components/dify/workflow/store'
import { consoleQuery } from '@/service/console'

const MessageLogModal = dynamic(() => import('@/components/dify/base/message-log-modal'), {
  ssr: false,
})
const Record = dynamic(() => import('@/components/dify/workflow/panel/record'), {
  ssr: false,
})
const ChatRecord = dynamic(() => import('@/components/dify/workflow/panel/chat-record'), {
  ssr: false,
})
const DebugAndPreview = dynamic(() => import('@/components/dify/workflow/panel/debug-and-preview'), {
  ssr: false,
})
const WorkflowPreview = dynamic(() => import('@/components/dify/workflow/panel/workflow-preview'), {
  ssr: false,
})
const ChatVariablePanel = dynamic(
  () => import('@/components/dify/workflow/panel/chat-variable-panel'),
  {
    ssr: false,
  },
)
const GlobalVariablePanel = dynamic(
  () => import('@/components/dify/workflow/panel/global-variable-panel'),
  {
    ssr: false,
  },
)

const WorkflowPanelOnLeft = ({ appId }: { appId: string }) => {
  const messageLogItem = useStore((state) => state.messageLogItem)
  const setMessageLogItem = useStore((state) => state.setMessageLogItem)
  return (
    <>
      {messageLogItem && (
        <MessageLogModal
          appId={appId}
          fixedWidth
          width={400}
          currentLogItem={messageLogItem}
          onCancel={() => setMessageLogItem(undefined)}
        />
      )}
    </>
  )
}
const WorkflowPanelOnRight = () => {
  const isChatflow = useAtomValue(isChatflowAtom)
  const historyWorkflowData = useStore((s) => s.historyWorkflowData)
  const showDebugAndPreviewPanel = useStore((s) => s.showDebugAndPreviewPanel)
  const showChatVariablePanel = useStore((s) => s.showChatVariablePanel)
  const showGlobalVariablePanel = useStore((s) => s.showGlobalVariablePanel)
  const controlMode = useStore((s) => s.controlMode)

  return (
    <>
      {historyWorkflowData && !isChatflow && <Record />}
      {historyWorkflowData && isChatflow && <ChatRecord />}
      {showDebugAndPreviewPanel && isChatflow && <DebugAndPreview />}
      {showDebugAndPreviewPanel && !isChatflow && <WorkflowPreview />}
      {showChatVariablePanel && isChatflow && <ChatVariablePanel />}
      {showGlobalVariablePanel && <GlobalVariablePanel />}
      {controlMode === 'comment' && <CommentsPanel />}
    </>
  )
}
const WorkflowPanel = () => {
  const { appId } = useAtomValue(workflowAppIdentityAtom)
  const { data: appDetail } = useSuspenseQuery(
    consoleQuery.apps.byAppId.get.queryOptions({ input: { params: { app_id: appId } } }),
  )
  const versionHistoryPanelProps = useMemo(() => {
    return {
      getVersionListUrl: `/apps/${appId}/workflows`,
      latestVersionId: appDetail.workflow?.id,
    }
  }, [appId, appDetail.workflow?.id])

  const panelProps: PanelProps = useMemo(() => {
    return {
      components: {
        left: <WorkflowPanelOnLeft appId={appId} />,
        right: <WorkflowPanelOnRight />,
      },
      versionHistoryPanelProps,
    }
  }, [appId, versionHistoryPanelProps])

  return <Panel {...panelProps} />
}

export default memo(WorkflowPanel)
