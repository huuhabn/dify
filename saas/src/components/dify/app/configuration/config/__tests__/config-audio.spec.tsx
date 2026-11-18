import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeaturesContext } from '@/components/dify/base/features/context'
import { createFeaturesStore } from '@/components/dify/base/features/store'
import { SupportUploadFileTypes } from '@/components/dify/workflow/types'
import { renderWithDebugConfiguration } from '@/test/debug-configuration'
import ConfigAudio from '../config-audio'

function renderConfig(allowedTypes: SupportUploadFileTypes[], isVisible = true) {
  const store = createFeaturesStore({
    features: { file: { allowed_file_types: allowedTypes, enabled: allowedTypes.length > 0 } },
  })
  renderWithDebugConfiguration(
    <FeaturesContext.Provider value={store}>
      <ConfigAudio />
    </FeaturesContext.Provider>,
    { isShowAudioConfig: isVisible },
  )
  return store
}

describe('ConfigAudio', () => {
  it('hides unavailable configuration', () => {
    renderConfig([], false)
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
  })

  it.each([{ remainingTypes: [] }, { remainingTypes: [SupportUploadFileTypes.document] }])(
    'toggles audio without losing the other upload types (%j)',
    async ({ remainingTypes }) => {
      const user = userEvent.setup()
      const store = renderConfig(remainingTypes)
      const toggle = screen.getByRole('switch')
      expect(toggle).not.toBeChecked()
      await user.click(toggle)
      expect(toggle).toBeChecked()
      expect(store.getState().features.file).toMatchObject({
        allowed_file_types: [...remainingTypes, SupportUploadFileTypes.audio],
        enabled: true,
      })
      await user.click(toggle)
      expect(toggle).not.toBeChecked()
      expect(store.getState().features.file).toMatchObject({
        allowed_file_types: remainingTypes,
        enabled: remainingTypes.length > 0,
      })
    },
  )
})
