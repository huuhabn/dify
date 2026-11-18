import type { HeaderProps } from '@/components/dify/workflow/header'
import { useAtomValue } from 'jotai'
import { memo, useMemo } from 'react'
import { knowledgePipelineIdentityAtom } from '@/components/dify/workflow/editor-resource/state'
import Header from '@/components/dify/workflow/header'
import InputFieldButton from './input-field-button'
import Publisher from './publisher/index'
import { RunMode } from './run-mode'

const RagPipelineHeader = () => {
  const pipelineId = useAtomValue(knowledgePipelineIdentityAtom).pipelineId

  const viewHistoryProps = useMemo(() => {
    return {
      historyUrl: `/rag/pipelines/${pipelineId}/workflow-runs`,
    }
  }, [pipelineId])

  const headerProps: HeaderProps = useMemo(() => {
    return {
      normal: {
        components: {
          left: <InputFieldButton />,
          middle: <Publisher />,
        },
        runAndHistoryProps: {
          showRunButton: true,
          viewHistoryProps,
          components: {
            RunMode,
          },
        },
      },
      viewHistory: {
        viewHistoryProps,
      },
    }
  }, [viewHistoryProps])

  return <Header {...headerProps} />
}

export default memo(RagPipelineHeader)
