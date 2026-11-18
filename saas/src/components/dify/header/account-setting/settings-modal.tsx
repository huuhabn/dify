'use client'

import type { SettingsDestination } from './query-params'
import dynamic from 'next/dynamic'
import { useQueryState } from 'nuqs'
import {
  isAccountSettingDestination,
  isIntegrationSettingDestination,
  settingsQueryParamName,
  settingsQueryParser,
} from './query-params'

// This controller is mounted globally, so concrete settings surfaces must stay lazy and only
// load after the URL selects their destination.
const AccountSetting = dynamic(() => import('@/components/dify/header/account-setting'), {
  ssr: false,
})
const IntegrationsSettingModal = dynamic(() => import('@/components/dify/integrations/modal'), {
  ssr: false,
})

export function SettingsModal() {
  const [destination, setDestination] = useQueryState(settingsQueryParamName, settingsQueryParser)

  const handleClose = () => {
    setDestination(null, { history: 'replace', shallow: true })
  }

  const handleDestinationChange = (nextDestination: SettingsDestination) => {
    setDestination(nextDestination, { history: 'replace', shallow: true })
  }

  if (isAccountSettingDestination(destination)) {
    return (
      <AccountSetting
        activeTab={destination}
        onCancelAction={handleClose}
        onTabChangeAction={handleDestinationChange}
      />
    )
  }

  if (isIntegrationSettingDestination(destination)) {
    return (
      <IntegrationsSettingModal
        section={destination}
        onCancel={handleClose}
        onSectionChange={handleDestinationChange}
      />
    )
  }

  return null
}
