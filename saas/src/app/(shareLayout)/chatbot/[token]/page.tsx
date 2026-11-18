'use client'
import * as React from 'react'
import EmbeddedChatbot from '@/components/dify/base/chat/embedded-chatbot'
import AuthenticatedLayout from '../../components/authenticated-layout'

const Chatbot = () => {
  return (
    <AuthenticatedLayout>
      <EmbeddedChatbot />
    </AuthenticatedLayout>
  )
}

export default React.memo(Chatbot)
