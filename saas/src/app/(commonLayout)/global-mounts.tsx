'use client'

import dynamic from 'next/dynamic'
import { Pricing } from '@/components/dify/billing/pricing'
import { SettingsModal } from '@/components/dify/header/account-setting/settings-modal'

const InSiteMessageNotification = dynamic(
  () => import('@/components/dify/app/in-site-message/notification'),
  { ssr: false },
)
const ReadmePanel = dynamic(() => import('@/components/dify/plugins/readme-panel'), { ssr: false })
const WorkflowGeneratorMount = dynamic(
  () => import('@/components/dify/workflow/workflow-generator/mount'),
  { ssr: false },
)
const GotoAnything = dynamic(
  () => import('@/components/dify/goto-anything').then((mod) => mod.GotoAnything),
  { ssr: false },
)

export function CommonLayoutGlobalMounts() {
  return (
    <>
      <InSiteMessageNotification />
      <ReadmePanel />
      <GotoAnything />
      <WorkflowGeneratorMount />
      <SettingsModal />
      <Pricing />
    </>
  )
}
