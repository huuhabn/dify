import type { InputVar } from '@/types/dify/pipeline'

export type SortableItem = {
  id: string
  chosen: boolean
  selected: boolean
} & InputVar
