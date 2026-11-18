import type { TFunction } from 'i18next'
import type { NodeDefault } from '../../types'
import type { DocExtractorNodeType } from './types'
import { BlockClassification } from '@/components/dify/workflow/block-selector/types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { genNodeMetaData } from '@/components/dify/workflow/utils'

const i18nPrefix = 'errorMsg'

const metaData = genNodeMetaData({
  classification: BlockClassification.Transform,
  sort: 4,
  type: BlockEnum.DocExtractor,
  helpLinkUri: 'doc-extractor',
})
const nodeDefault: NodeDefault<DocExtractorNodeType> = {
  metaData,
  defaultValue: {
    variable_selector: [],
    is_array_file: false,
  },
  checkValid(payload: DocExtractorNodeType, t: TFunction<['workflow']>) {
    let errorMessages = ''
    const { variable_selector: variable } = payload

    if (!errorMessages && !variable?.length)
      errorMessages = t(($) => $[`${i18nPrefix}.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $['nodes.assigner.assignedVariable'], { ns: 'workflow' }),
      })

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
