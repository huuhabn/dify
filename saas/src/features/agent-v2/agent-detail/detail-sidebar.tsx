'use client'

import { DetailSidebarFrame } from '@/components/dify/detail-sidebar'
import { AgentDetailSection, AgentDetailTop } from './navigation'

export function AgentDetailSidebar() {
  return (
    <DetailSidebarFrame
      renderTop={({ expand, onToggle }) => <AgentDetailTop expand={expand} onToggle={onToggle} />}
      renderSection={({ expand }) => <AgentDetailSection expand={expand} />}
    />
  )
}
