import type { CommonNodeType, Variable } from '@/components/dify/workflow/types'

export type EndNodeType = CommonNodeType & {
  outputs: Variable[]
}
