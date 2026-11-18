import type { TFunction } from 'i18next'
import type { NodeDefault } from '../../types'
import type { CodeNodeType } from './types'
import { BlockClassification } from '@/components/dify/workflow/block-selector/types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { genNodeMetaData } from '@/components/dify/workflow/utils'
import { CodeLanguage } from './types'

const i18nPrefix = 'errorMsg'

const metaData = genNodeMetaData({
  classification: BlockClassification.Transform,
  sort: 1,
  type: BlockEnum.Code,
})
const nodeDefault: NodeDefault<CodeNodeType> = {
  metaData,
  defaultValue: {
    code: '',
    code_language: CodeLanguage.python3,
    variables: [],
    outputs: {},
  },
  checkValid(payload: CodeNodeType, t: TFunction<['workflow']>) {
    let errorMessages = ''
    const { code, variables } = payload
    if (!errorMessages && variables.filter((v) => !v.variable).length > 0)
      errorMessages = t(($) => $[`${i18nPrefix}.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}.fields.variable`], { ns: 'workflow' }),
      })
    if (!errorMessages && variables.filter((v) => !v.value_selector.length).length > 0)
      errorMessages = t(($) => $[`${i18nPrefix}.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}.fields.variableValue`], { ns: 'workflow' }),
      })
    if (!errorMessages && !code)
      errorMessages = t(($) => $[`${i18nPrefix}.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}.fields.code`], { ns: 'workflow' }),
      })

    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
