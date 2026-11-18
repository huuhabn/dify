import SnippetAndEvaluationPlanGuard from '@/components/dify/billing/snippet-and-evaluation-plan-guard'
import Evaluation from '@/components/dify/evaluation'

const Page = async (props: { params: Promise<{ datasetId: string }> }) => {
  const { datasetId } = await props.params

  return (
    <SnippetAndEvaluationPlanGuard fallbackHref={`/datasets/${datasetId}/documents`}>
      <Evaluation resourceType="datasets" resourceId={datasetId} />
    </SnippetAndEvaluationPlanGuard>
  )
}

export default Page
