import { useHooksStore } from '@/components/dify/workflow/hooks-store'

export const useWorkflowRefreshDraft = () => {
  const handleRefreshWorkflowDraft = useHooksStore((s) => s.handleRefreshWorkflowDraft)

  return {
    handleRefreshWorkflowDraft,
  }
}
