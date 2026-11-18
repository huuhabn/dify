'use client'

import AmplitudeProvider from '@/components/dify/base/amplitude'
import { RegistrationConsentCoordinator } from '@/components/dify/base/amplitude/registration-consent-coordinator'
import ExternalAttributionRecorder from '@/components/dify/external-attribution-recorder'
import { CookieYesConsentBridge } from './cookieyes-consent-bridge'

export function ConsoleAnalyticsRuntime() {
  return (
    <>
      <CookieYesConsentBridge />
      <AmplitudeProvider />
      <RegistrationConsentCoordinator />
      <ExternalAttributionRecorder />
    </>
  )
}
