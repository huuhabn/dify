import type { CommonNodeType, NodeDefault } from '../../types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { genNodeMetaData } from '@/components/dify/workflow/utils'

const metaData = genNodeMetaData({
  sort: -1,
  type: BlockEnum.IterationStart,
})
const nodeDefault: NodeDefault<CommonNodeType> = {
  metaData,
  defaultValue: {},
  checkValid() {
    return {
      isValid: true,
    }
  },
}

export default nodeDefault
