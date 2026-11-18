'use client'

import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'
import WorkflowWithDefaultContext from '@/components/dify/workflow'
import { WorkflowContextProvider } from '@/components/dify/workflow/context'
import { EditorResourceScope } from '@/components/dify/workflow/editor-resource/provider'
import { snippetIdentityAtom } from '@/components/dify/workflow/editor-resource/state'
import { initialEdges, initialNodes } from '@/components/dify/workflow/utils'
import SnippetLayout from './components/snippet-layout'
import SnippetMain from './components/snippet-main'
import { useSnippetInit } from './hooks/use-snippet-init'

type SnippetPageProps = {
  snippetId: string
}

const SnippetPageLoading = ({ snippetId }: SnippetPageProps) => {
  return (
    <SnippetLayout snippetId={snippetId} section="orchestrate">
      <div className="flex h-full items-center justify-center bg-background-body">
        <LoadingPlaceholder />
      </div>
    </SnippetLayout>
  )
}

const SnippetPage = () => {
  const { snippetId } = useAtomValue(snippetIdentityAtom)
  const { data, isLoading } = useSnippetInit(snippetId)
  const publishedNodesData = useMemo(() => {
    if (!data) return []

    return initialNodes(data.published.graph.nodes, data.published.graph.edges)
  }, [data])
  const publishedEdgesData = useMemo(() => {
    if (!data) return []

    return initialEdges(data.published.graph.edges, data.published.graph.nodes)
  }, [data])
  const draftNodesData = useMemo(() => {
    if (!data) return []

    return initialNodes(data.draft.graph.nodes, data.draft.graph.edges)
  }, [data])
  const draftEdgesData = useMemo(() => {
    if (!data) return []

    return initialEdges(data.draft.graph.edges, data.draft.graph.nodes)
  }, [data])

  if (!data || isLoading) {
    return <SnippetPageLoading snippetId={snippetId} />
  }

  const hasPublishedWorkflow = !!data.publishedWorkflow
  const initialWorkflowNodesData = hasPublishedWorkflow ? publishedNodesData : draftNodesData
  const initialWorkflowEdgesData = hasPublishedWorkflow ? publishedEdgesData : draftEdgesData

  return (
    <SnippetLayout snippetId={snippetId} snippet={data.snippet} section="orchestrate">
      <WorkflowWithDefaultContext edges={initialWorkflowEdgesData} nodes={initialWorkflowNodesData}>
        <SnippetMain
          payload={data.published}
          draftPayload={data.draft}
          hasInitialDraftChanges={data.hasDraftChanges}
          hasPublishedWorkflow={hasPublishedWorkflow}
          nodes={publishedNodesData}
          edges={publishedEdgesData}
          viewport={data.published.graph.viewport}
          draftNodes={draftNodesData}
          draftEdges={draftEdgesData}
          draftViewport={data.draft.graph.viewport}
        />
      </WorkflowWithDefaultContext>
    </SnippetLayout>
  )
}

const SnippetPageWrapper = ({ snippetId }: SnippetPageProps) => {
  return (
    <EditorResourceScope resource={{ kind: 'snippet', snippetId }}>
      <WorkflowContextProvider>
        <SnippetPage />
      </WorkflowContextProvider>
    </EditorResourceScope>
  )
}

export default SnippetPageWrapper
