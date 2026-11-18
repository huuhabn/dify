import Evaluation from '@/components/dify/evaluation'

type AgentEvaluationPageProps = {
  agentId: string
}

export function AgentEvaluationPage({ agentId }: AgentEvaluationPageProps) {
  return <Evaluation resourceType="agents" resourceId={agentId} />
}
