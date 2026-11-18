import DatasetUpdateForm from '@/components/dify/datasets/create'
import { getRouteMetadata } from '@/app/route-metadata'

export function generateMetadata() {
  return getRouteMetadata(
    'onboarding',
    ($) => $['stepByStepTour.guides.knowledge.empty.create.title'],
  )
}

const DatasetCreation = () => {
  return <DatasetUpdateForm />
}

export default DatasetCreation
