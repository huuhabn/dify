'use client'

import type { PanelProps } from '@/components/dify/workflow/panel'
import type { InputVar } from '@/types/dify/pipeline'
import dynamic from 'next/dynamic'
import { memo, useMemo } from 'react'
import Panel from '@/components/dify/workflow/panel'
import { useStore } from '@/components/dify/workflow/store'

const Record = dynamic(() => import('@/components/dify/workflow/panel/record'), {
  ssr: false,
})
const SnippetRunPanel = dynamic(() => import('./snippet-run-panel'), {
  ssr: false,
})

type SnippetWorkflowPanelProps = {
  snippetId: string
  fields: InputVar[]
}

const SnippetPanelOnRight = ({ fields }: Pick<SnippetWorkflowPanelProps, 'fields'>) => {
  const historyWorkflowData = useStore((s) => s.historyWorkflowData)
  const showDebugAndPreviewPanel = useStore((s) => s.showDebugAndPreviewPanel)

  return (
    <>
      {historyWorkflowData && <Record />}
      {showDebugAndPreviewPanel && <SnippetRunPanel fields={fields} />}
    </>
  )
}

const SnippetWorkflowPanel = ({ snippetId, fields }: SnippetWorkflowPanelProps) => {
  const versionHistoryPanelProps = useMemo(() => {
    return {
      getVersionListUrl: `/snippets/${snippetId}/workflows`,
      latestVersionId: '',
    }
  }, [snippetId])

  const panelProps: PanelProps = useMemo(() => {
    return {
      components: {
        right: <SnippetPanelOnRight fields={fields} />,
      },
      versionHistoryPanelProps,
    }
  }, [fields, versionHistoryPanelProps])

  return <Panel {...panelProps} />
}

export default memo(SnippetWorkflowPanel)
