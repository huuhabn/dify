import type { TFunction } from 'i18next'
import type { NodeDefault } from '../../types'
import type { ParameterExtractorNodeType } from './types'
import { BlockClassification } from '@/components/dify/workflow/block-selector/types'
import { BlockEnum } from '@/components/dify/workflow/types'
import { genNodeMetaData } from '@/components/dify/workflow/utils'
import { ReasoningModeType } from './types'

const i18nPrefix = ''

const metaData = genNodeMetaData({
  classification: BlockClassification.Transform,
  sort: 6,
  type: BlockEnum.ParameterExtractor,
})
const nodeDefault: NodeDefault<ParameterExtractorNodeType> = {
  metaData,
  defaultValue: {
    query: [],
    model: {
      provider: '',
      name: '',
      mode: 'chat' as const,
      completion_params: {
        temperature: 0.7,
      },
    },
    reasoning_mode: ReasoningModeType.prompt,
    vision: {
      enabled: false,
    },
  },
  checkValid(payload: ParameterExtractorNodeType, t: TFunction<['workflow']>) {
    let errorMessages = ''
    if (!errorMessages && (!payload.query || payload.query.length === 0))
      errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}nodes.parameterExtractor.inputVar`], { ns: 'workflow' }),
      })

    if (!errorMessages && !payload.model.provider)
      errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}errorMsg.fields.model`], { ns: 'workflow' }),
      })

    if (!errorMessages && (!payload.parameters || payload.parameters.length === 0))
      errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}nodes.parameterExtractor.extractParameters`], {
          ns: 'workflow',
        }),
      })

    if (!errorMessages) {
      payload.parameters.forEach((param) => {
        if (errorMessages) return
        if (!param.name) {
          errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
            ns: 'workflow',
            field: t(
              ($) =>
                $[
                  `${i18nPrefix}nodes.parameterExtractor.addExtractParameterContent.namePlaceholder`
                ],
              { ns: 'workflow' },
            ),
          })
          return
        }
        if (!param.type) {
          errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
            ns: 'workflow',
            field: t(
              ($) =>
                $[
                  `${i18nPrefix}nodes.parameterExtractor.addExtractParameterContent.typePlaceholder`
                ],
              { ns: 'workflow' },
            ),
          })
          return
        }
        if (!param.description)
          errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
            ns: 'workflow',
            field: t(
              ($) =>
                $[
                  `${i18nPrefix}nodes.parameterExtractor.addExtractParameterContent.descriptionPlaceholder`
                ],
              { ns: 'workflow' },
            ),
          })
      })
    }
    if (
      !errorMessages &&
      payload.vision?.enabled &&
      !payload.vision.configs?.variable_selector?.length
    )
      errorMessages = t(($) => $[`${i18nPrefix}errorMsg.fieldRequired`], {
        ns: 'workflow',
        field: t(($) => $[`${i18nPrefix}errorMsg.fields.visionVariable`], { ns: 'workflow' }),
      })
    return {
      isValid: !errorMessages,
      errorMessage: errorMessages,
    }
  },
}

export default nodeDefault
