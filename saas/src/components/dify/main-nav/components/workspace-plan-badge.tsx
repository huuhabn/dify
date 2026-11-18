import type { CloudPlan } from '@dify/contracts/api/console/workspaces/types.gen'
import Badge from '@/components/dify/base/badge'
import { PlanBadge } from '@/components/dify/header/plan-badge'

type WorkspacePlanBadgeProps = {
  plan: CloudPlan
}

const WorkspacePlanBadge = ({ plan }: WorkspacePlanBadgeProps) => {
  if (plan !== 'sandbox') return <PlanBadge plan={plan} />

  return (
    <Badge size="xs" variant="dimm" className="shrink-0">
      {plan}
    </Badge>
  )
}

export default WorkspacePlanBadge
