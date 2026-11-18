import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { isChatflowAtom } from '@/components/dify/workflow/editor-resource/state'
import ChatVariableButton from '@/components/dify/workflow/header/chat-variable-button'
import { useNodesReadOnly } from '@/components/dify/workflow/hooks/use-workflow'

const ChatVariableTrigger = () => {
  const { nodesReadOnly } = useNodesReadOnly()
  const isChatflow = useAtomValue(isChatflowAtom)

  if (!isChatflow) return null

  return <ChatVariableButton disabled={nodesReadOnly} />
}
export default memo(ChatVariableTrigger)
