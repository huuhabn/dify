import type { ReactNode } from 'react'
import { TriggerEventsLimitPrompt } from '@/components/dify/billing/trigger-events-limit-modal/prompt'
import { ModelCredentialDialog } from '@/components/dify/header/account-setting/model-provider-page/model-modal/dialog'
import { OAuthRegistrationAnalytics } from '@/components/dify/oauth-registration-analytics'
import { EventEmitterContextProvider } from '@/context/event-emitter-provider'
import { ExternalServiceSync } from './external-service-sync'
import { CommonLayoutHydrationBoundary } from './hydration-boundary'

export async function ConsoleRuntimeProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <OAuthRegistrationAnalytics />
      <CommonLayoutHydrationBoundary>
        <ExternalServiceSync />
        {children}
      </CommonLayoutHydrationBoundary>
    </>
  )
}

export function ConsoleContextProviders({ children }: { children: ReactNode }) {
  return (
    <EventEmitterContextProvider>
      {children}
      <ModelCredentialDialog />
      <TriggerEventsLimitPrompt />
    </EventEmitterContextProvider>
  )
}
