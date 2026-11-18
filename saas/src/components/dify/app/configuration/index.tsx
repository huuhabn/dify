'use client'
import * as React from 'react'
import { AppToaster } from '@/components/providers/notifications/app-toaster'
import ConfigurationView from './configuration-view/index'
import { useConfiguration } from './hooks/use-configuration'
import { appConfigurationToastManager } from './toast'

const Configuration = () => {
  const viewModel = useConfiguration()
  return (
    <>
      <AppToaster manager={appConfigurationToastManager} offset={{ top: 60 }} />
      <ConfigurationView {...viewModel} />
    </>
  )
}

export default React.memo(Configuration)
