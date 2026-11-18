import ExternalKnowledgeBaseConnector from '@/components/dify/datasets/external-knowledge-base/connector'
import { getRouteMetadata } from '@/app/route-metadata'

export function generateMetadata() {
  return getRouteMetadata(
    'onboarding',
    ($) => $['stepByStepTour.guides.knowledge.empty.connect.title'],
  )
}

const ExternalKnowledgeBaseCreation = () => {
  return <ExternalKnowledgeBaseConnector />
}

export default ExternalKnowledgeBaseCreation
