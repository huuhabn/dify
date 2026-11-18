import type { CommonNodeType, NodeDefault } from '../../types'
import { BlockClassification } from '@/components/dify/workflow/block-selector/types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { genNodeMetaData } from '@/components/dify/workflow/utils'

const metaData = genNodeMetaData({
  classification: BlockClassification.Logic,
  sort: 2,
  type: BlockEnum.LoopEnd,
  isSingleton: true,
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
