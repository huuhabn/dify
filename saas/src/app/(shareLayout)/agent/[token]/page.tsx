'use client'

import * as React from 'react'
import ChatWithHistoryWrap from '@/components/dify/base/chat/chat-with-history'
import { AgentRosterResponseContent } from '@/components/dify/base/chat/chat/answer/agent-roster-response-content'
import AuthenticatedLayout from '../../components/authenticated-layout'

function Agent() {
  return (
    <AuthenticatedLayout>
      <ChatWithHistoryWrap isNewAgent renderAgentContent={AgentRosterResponseContent} />
    </AuthenticatedLayout>
  )
}

export default React.memo(Agent)
