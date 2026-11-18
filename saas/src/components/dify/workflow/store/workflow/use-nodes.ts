import { useStore } from '@/components/dify/workflow/store'

const useWorkflowNodes = () => useStore((s) => s.nodes)

export default useWorkflowNodes
