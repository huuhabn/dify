'use client'

import type { CreateKnowledgeBaseReq } from '@/components/dify/datasets/external-knowledge-base/create/declarations'
import * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/components/dify/base/amplitude'
import ExternalKnowledgeBaseCreate from '@/components/dify/datasets/external-knowledge-base/create'
import { toast } from '@/components/providers/notifications'
import useDocumentTitle from '@/hooks/use-document-title'
import { useRouter } from '@/next/navigation'
import { createExternalKnowledgeBase } from '@/service/datasets'
import { getErrorMessage } from '@/utils/error-message'

const ExternalKnowledgeBaseConnector = () => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation(['dataset', 'onboarding'])
  useDocumentTitle(
    t(($) => $['stepByStepTour.guides.knowledge.empty.connect.title'], { ns: 'onboarding' }),
  )

  const handleConnect = async (formValue: CreateKnowledgeBaseReq) => {
    try {
      setLoading(true)
      const result = await createExternalKnowledgeBase({ body: formValue }, { silent: true })
      if (result && result.id) {
        toast.success(t(($) => $['externalKnowledgeForm.connectedSuccess'], { ns: 'dataset' }))
        trackEvent('create_external_knowledge_base', {
          provider: formValue.provider,
          name: formValue.name,
        })
        router.back()
      } else {
        throw new Error('Failed to create external knowledge base')
      }
    } catch (error) {
      console.error('Error creating external knowledge base:', error)
      toast.error(
        getErrorMessage(error) ??
          t(($) => $['externalKnowledgeForm.connectedFailed'], { ns: 'dataset' }),
      )
    }
    setLoading(false)
  }
  return <ExternalKnowledgeBaseCreate onConnect={handleConnect} loading={loading} />
}

export default ExternalKnowledgeBaseConnector
