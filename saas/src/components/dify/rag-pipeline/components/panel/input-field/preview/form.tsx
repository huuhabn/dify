import type { RAGPipelineVariables } from '@/types/dify/pipeline'
import { useAppForm } from '@/components/dify/base/form'
import BaseField from '@/components/dify/base/form/form-scenarios/base/field'
import { useConfigurations, useInitialData } from '../../../../hooks/use-input-fields'

type FormProps = {
  variables: RAGPipelineVariables
}

const Form = ({ variables }: FormProps) => {
  const initialData = useInitialData(variables)
  const configurations = useConfigurations(variables)

  const form = useAppForm({
    defaultValues: initialData,
  })

  return (
    <form
      className="w-full"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className="flex flex-col gap-y-3 px-4 py-3">
        {configurations.map((config, index) => {
          const FieldComponent = BaseField({
            initialData,
            config,
          })
          return <FieldComponent key={index} form={form} />
        })}
      </div>
    </form>
  )
}

export default Form
