import { useMemo } from 'react'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'
import WorkflowWithDefaultContext from '@/components/dify/workflow'
import { WorkflowContextProvider } from '@/components/dify/workflow/context'
import { EditorResourceScope } from '@/components/dify/workflow/editor-resource/provider'
import { initialEdges, initialNodes } from '@/components/dify/workflow/utils'
import { useDatasetDetailContextWithSelector } from '@/context/dataset-detail'
import Conversion from './components/conversion'
import RagPipelineMain from './components/rag-pipeline-main'
import { usePipelineInit } from './hooks/use-pipeline-init'
import { createRagPipelineSliceSlice } from './store/index'
import { processNodesWithoutDataSource } from './utils/index'

const RagPipeline = () => {
  const { data, isLoading } = usePipelineInit()
  const nodesData = useMemo(() => {
    if (data) return initialNodes(data.graph.nodes, data.graph.edges)

    return []
  }, [data])
  const edgesData = useMemo(() => {
    if (data) return initialEdges(data.graph.edges, data.graph.nodes)

    return []
  }, [data])

  if (!data || isLoading) {
    return (
      <div className="relative flex size-full items-center justify-center">
        <LoadingPlaceholder />
      </div>
    )
  }

  const { nodes: processedNodes, viewport } = processNodesWithoutDataSource(
    nodesData,
    data.graph.viewport,
  )
  return (
    <WorkflowWithDefaultContext edges={edgesData} nodes={processedNodes}>
      <RagPipelineMain edges={edgesData} nodes={processedNodes} viewport={viewport} />
    </WorkflowWithDefaultContext>
  )
}

const RagPipelineWrapper = () => {
  const pipelineId = useDatasetDetailContextWithSelector((s) => s.dataset?.pipeline_id)

  if (!pipelineId) return <Conversion />

  return (
    <EditorResourceScope resource={{ kind: 'knowledge-pipeline', pipelineId }}>
      <WorkflowContextProvider injectWorkflowStoreSliceFn={createRagPipelineSliceSlice}>
        <RagPipeline />
      </WorkflowContextProvider>
    </EditorResourceScope>
  )
}

export default RagPipelineWrapper
