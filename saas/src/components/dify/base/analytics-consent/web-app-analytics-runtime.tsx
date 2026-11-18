'use client'

import { WebAppAmplitudeProvider } from '@/components/dify/base/amplitude/WebAppAmplitudeProvider'
import { CookieYesConsentBridge } from './cookieyes-consent-bridge'

export function WebAppAnalyticsRuntime() {
  return (
    <>
      <CookieYesConsentBridge />
      <WebAppAmplitudeProvider />
    </>
  )
}
