import type { CommonNodeType, InputVar } from '@/components/dify/workflow/types'

export type StartNodeType = CommonNodeType & {
  variables: InputVar[]
}
