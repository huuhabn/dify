import { useHooksStore } from '@/components/dify/workflow/hooks-store'

export const useSetWorkflowVarsWithValue = () => {
  const fetchInspectVars = useHooksStore((s) => s.fetchInspectVars)

  return {
    fetchInspectVars,
  }
}
