'use client'

import { useEffect } from 'react'
import { coordinateRegistrationConsent } from '@/components/dify/base/amplitude/registration-tracking'
import { setAnalyticsConsent } from './consent-store'

export function AnalyticsDisabled() {
  useEffect(() => {
    setAnalyticsConsent('disabled')
    coordinateRegistrationConsent('disabled')
  }, [])

  return null
}
