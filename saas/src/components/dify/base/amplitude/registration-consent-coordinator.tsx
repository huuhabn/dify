'use client'

import { useEffect } from 'react'
import { useAnalyticsConsent } from '@/components/dify/base/analytics-consent/consent-store'
import { coordinateRegistrationConsent } from './registration-tracking'

export function RegistrationConsentCoordinator() {
  const consent = useAnalyticsConsent()

  useEffect(() => {
    coordinateRegistrationConsent(consent)
  }, [consent])

  return null
}
