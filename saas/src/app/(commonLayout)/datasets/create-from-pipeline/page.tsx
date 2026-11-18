import CreateFromPipeline from '@/components/dify/datasets/create-from-pipeline'
import { getRouteMetadata } from '@/app/route-metadata'

export function generateMetadata() {
  return getRouteMetadata(
    'onboarding',
    ($) => $['stepByStepTour.guides.knowledge.empty.pipeline.title'],
  )
}

const DatasetCreation = () => {
  return <CreateFromPipeline />
}

export default DatasetCreation
