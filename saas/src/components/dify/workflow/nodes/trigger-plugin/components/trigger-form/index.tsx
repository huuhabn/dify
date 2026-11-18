'use client'
import type { FC } from 'react'
import type { CredentialFormSchema } from '@/components/dify/header/account-setting/model-provider-page/declarations'
import type { Event } from '@/components/dify/tools/types'
import type { TriggerWithProvider } from '@/components/dify/workflow/block-selector/types'
import type { ResourceVarInputs } from '@/components/dify/workflow/nodes/_base/types'
import { TriggerFormItem } from './item'

type Props = Readonly<{
  readOnly: boolean
  nodeId: string
  schema: CredentialFormSchema[]
  value: ResourceVarInputs
  onChange: (value: ResourceVarInputs) => void
  onOpen?: (index: number) => void
  currentEvent?: Event
  currentProvider?: TriggerWithProvider
  extraParams?: Record<string, any>
  disableVariableInsertion?: boolean
}>

const TriggerForm: FC<Props> = ({
  readOnly,
  nodeId,
  schema,
  value,
  onChange,
  currentEvent,
  currentProvider,
  extraParams,
  disableVariableInsertion = false,
}) => {
  return (
    <div className="space-y-1">
      {schema.map((schema, index) => (
        <TriggerFormItem
          key={index}
          readOnly={readOnly}
          nodeId={nodeId}
          schema={schema}
          value={value}
          onChange={onChange}
          currentEvent={currentEvent}
          currentProvider={currentProvider}
          extraParams={extraParams}
          disableVariableInsertion={disableVariableInsertion}
        />
      ))}
    </div>
  )
}
export default TriggerForm
