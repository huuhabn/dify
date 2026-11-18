import type { Node } from '@/components/dify/workflow/types'

export type NodeActionsMenuProps = {
  id: string
  data: Node['data']
  onClose: () => void
  showHelpLink?: boolean
}
