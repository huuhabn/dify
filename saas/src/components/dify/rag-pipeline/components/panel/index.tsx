import type { PanelProps } from '@/components/dify/workflow/panel'
import { useAtomValue } from 'jotai'
import dynamic from 'next/dynamic'
import { memo, useMemo } from 'react'
import { knowledgePipelineIdentityAtom } from '@/components/dify/workflow/editor-resource/state'
import Panel from '@/components/dify/workflow/panel'
import { useStore } from '@/components/dify/workflow/store'

const Record = dynamic(() => import('@/components/dify/workflow/panel/record'), {
  ssr: false,
})
const TestRunPanel = dynamic(
  () => import('@/components/dify/rag-pipeline/components/panel/test-run'),
  {
    ssr: false,
  },
)
const InputFieldPanel = dynamic(() => import('./input-field/index'), {
  ssr: false,
})
const InputFieldEditorPanel = dynamic(() => import('./input-field/editor/index'), {
  ssr: false,
})
const PreviewPanel = dynamic(() => import('./input-field/preview/index'), {
  ssr: false,
})
const GlobalVariablePanel = dynamic(
  () => import('@/components/dify/workflow/panel/global-variable-panel'),
  {
    ssr: false,
  },
)
const RagPipelinePanelOnRight = () => {
  const historyWorkflowData = useStore((s) => s.historyWorkflowData)
  const showDebugAndPreviewPanel = useStore((s) => s.showDebugAndPreviewPanel)
  const showGlobalVariablePanel = useStore((s) => s.showGlobalVariablePanel)

  return (
    <>
      {historyWorkflowData && <Record />}
      {showDebugAndPreviewPanel && <TestRunPanel />}
      {showGlobalVariablePanel && <GlobalVariablePanel />}
    </>
  )
}

const RagPipelinePanelOnLeft = () => {
  const showInputFieldPanel = useStore((s) => s.showInputFieldPanel)
  const showInputFieldPreviewPanel = useStore((s) => s.showInputFieldPreviewPanel)
  const inputFieldEditPanelProps = useStore((s) => s.inputFieldEditPanelProps)
  return (
    <>
      {showInputFieldPreviewPanel && <PreviewPanel />}
      {inputFieldEditPanelProps && <InputFieldEditorPanel {...inputFieldEditPanelProps} />}
      {showInputFieldPanel && <InputFieldPanel />}
    </>
  )
}

const RagPipelinePanel = () => {
  const pipelineId = useAtomValue(knowledgePipelineIdentityAtom).pipelineId
  const versionHistoryPanelProps = useMemo(() => {
    return {
      getVersionListUrl: `/rag/pipelines/${pipelineId}/workflows`,
      latestVersionId: '',
    }
  }, [pipelineId])

  const panelProps: PanelProps = useMemo(() => {
    return {
      components: {
        left: <RagPipelinePanelOnLeft />,
        right: <RagPipelinePanelOnRight />,
      },
      versionHistoryPanelProps,
    }
  }, [versionHistoryPanelProps])

  return <Panel {...panelProps} />
}

export default memo(RagPipelinePanel)
