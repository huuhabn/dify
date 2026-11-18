import { REQUEST_URL_PLACEHOLDER_TEXT } from '@/components/dify/base/prompt-editor/constants'

export const getRequestURLCount = (body: string): number =>
  body.split(REQUEST_URL_PLACEHOLDER_TEXT).length - 1
