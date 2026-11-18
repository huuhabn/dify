import SnippetAndEvaluationPlanGuard from '@/components/dify/billing/snippet-and-evaluation-plan-guard'
import Evaluation from '@/components/dify/evaluation'

const Page = async (props: { params: Promise<{ appId: string }> }) => {
  const { appId } = await props.params

  return (
    <SnippetAndEvaluationPlanGuard fallbackHref={`/app/${appId}/overview`}>
      <Evaluation resourceType="apps" resourceId={appId} />
    </SnippetAndEvaluationPlanGuard>
  )
}

export default Page
