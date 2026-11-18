'use client'
import * as React from 'react'
import ChatWithHistoryWrap from '@/components/dify/base/chat/chat-with-history'
import AuthenticatedLayout from '../../components/authenticated-layout'

const Chat = () => {
  return (
    <AuthenticatedLayout>
      <ChatWithHistoryWrap />
    </AuthenticatedLayout>
  )
}

export default React.memo(Chat)
