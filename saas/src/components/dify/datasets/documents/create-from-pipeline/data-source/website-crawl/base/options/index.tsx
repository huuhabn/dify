import type { RAGPipelineVariables } from '@/types/dify/pipeline'
import { Button } from '@langgenius/dify-ui/button'
import { cn } from '@langgenius/dify-ui/cn'
import { RiPlayLargeLine } from '@remixicon/react'
import { useBoolean } from 'ahooks'
import { useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppForm } from '@/components/dify/base/form'
import BaseField from '@/components/dify/base/form/form-scenarios/base/field'
import { generateZodSchema } from '@/components/dify/base/form/form-scenarios/base/utils'
import {
  useConfigurations,
  useInitialData,
} from '@/components/dify/rag-pipeline/hooks/use-input-fields'
import { toast } from '@/components/providers/notifications'
import { CrawlStep } from '@/types/dify/datasets'

const I18N_PREFIX = 'stepOne.website'

type OptionsProps = {
  variables: RAGPipelineVariables
  step: CrawlStep
  runDisabled?: boolean
  onSubmit: (data: Record<string, any>) => void
}

const Options = ({ variables, step, runDisabled, onSubmit }: OptionsProps) => {
  const { t } = useTranslation(['datasetCreation'])
  const runButtonLabelId = useId()
  const initialData = useInitialData(variables)
  const configurations = useConfigurations(variables)
  const schema = useMemo(() => {
    return generateZodSchema(configurations)
  }, [configurations])

  const form = useAppForm({
    defaultValues: initialData,
    validators: {
      onSubmit: ({ value }) => {
        const result = schema.safeParse(value)
        if (!result.success) {
          const issues = result.error.issues
          const firstIssue = issues[0]
          const errorMessage = `"${firstIssue!.path.join('.')}" ${firstIssue!.message}`
          toast.error(errorMessage)
          return errorMessage
        }
        return undefined
      },
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })

  const [fold, { toggle: foldToggle, setTrue: foldHide, setFalse: foldShow }] = useBoolean(false)

  useEffect(() => {
    // When the step change
    if (step !== CrawlStep.init) foldHide()
    else foldShow()
  }, [step])

  const isRunning = step === CrawlStep.running

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <div className="flex items-center gap-x-1 px-4 py-2">
        <div
          className="flex grow cursor-pointer items-center gap-x-0.5 select-none"
          onClick={foldToggle}
        >
          <span className="system-sm-semibold-uppercase text-text-secondary">
            {t(($) => $[`${I18N_PREFIX}.options`], { ns: 'datasetCreation' })}
          </span>
          <span
            aria-hidden
            className={cn(
              'i-custom-vender-solid-general-arrow-down-round-fill h-4 w-4',
              cn('size-4 shrink-0 text-text-quaternary', fold && '-rotate-90'),
            )}
          />
        </div>
        <Button
          variant="primary"
          onClick={form.handleSubmit}
          disabled={runDisabled}
          loading={isRunning}
          aria-labelledby={runButtonLabelId}
          className="shrink-0"
        >
          <RiPlayLargeLine aria-hidden className="size-4" />
          <span id={runButtonLabelId}>
            {!isRunning
              ? t(($) => $[`${I18N_PREFIX}.run`], { ns: 'datasetCreation' })
              : t(($) => $[`${I18N_PREFIX}.running`], { ns: 'datasetCreation' })}
          </span>
        </Button>
      </div>
      {!fold && (
        <div className="flex flex-col gap-3 border-t border-divider-subtle px-4 py-3">
          {configurations.map((config, index) => {
            const FieldComponent = BaseField({
              initialData,
              config,
            })
            return <FieldComponent key={index} form={form} />
          })}
        </div>
      )}
    </form>
  )
}

export default Options
