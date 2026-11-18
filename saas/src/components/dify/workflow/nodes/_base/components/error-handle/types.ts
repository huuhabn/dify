import type { VarType } from '@/components/dify/workflow/types'

export const ErrorHandleTypeEnum = {
  none: 'none',
  failBranch: 'fail-branch',
  defaultValue: 'default-value',
} as const

export type ErrorHandleTypeEnum = (typeof ErrorHandleTypeEnum)[keyof typeof ErrorHandleTypeEnum]

export type DefaultValueForm = {
  key: string
  type: VarType
  value?: any
}
