import type { FC } from 'react'
import type { ChatItem } from '../../types'
import type { FileEntity } from '@/components/dify/base/file-uploader/types'
import type { FileResponse } from '@/types/workflow'
import { memo } from 'react'
import Thought from '@/components/dify/base/chat/chat/thought'
import { FileList } from '@/components/dify/base/file-uploader'
import { getProcessedFilesFromResponse } from '@/components/dify/base/file-uploader/utils'
import { Markdown } from '@/components/dify/base/markdown'

type AgentContentProps = {
  item: ChatItem
  responding?: boolean
  content?: string
}
const AgentContent: FC<AgentContentProps> = ({ item, responding, content }) => {
  const { annotation, agent_thoughts } = item

  if (annotation?.logAnnotation) {
    return (
      <Markdown
        content={annotation?.logAnnotation.content || ''}
        data-testid="agent-content-markdown"
      />
    )
  }

  return (
    <div data-testid="agent-content-container">
      {content ? (
        <Markdown content={content} data-testid="agent-content-markdown" />
      ) : (
        agent_thoughts?.map((thought, index) => (
          <div key={index} className="px-2 py-1" data-testid="agent-thought-item">
            {thought.thought && (
              <Markdown content={thought.thought} data-testid="agent-thought-markdown" />
            )}
            {/* {item.tool} */}
            {/* perhaps not use tool */}
            {!!thought.tool && (
              <Thought thought={thought} isFinished={!!thought.observation || !responding} />
            )}

            {!!thought.message_files?.length && (
              <FileList
                files={thought.message_files.flatMap(
                  (file: FileEntity | (FileResponse & { id?: string })) =>
                    // Streaming files are normalized already; historical thoughts can carry API metadata.
                    'transferMethod' in file
                      ? [file]
                      : getProcessedFilesFromResponse([
                          { ...file, related_id: file.id ?? file.related_id },
                        ]),
                )}
                showDeleteAction={false}
                showDownloadAction={true}
                canPreview={true}
              />
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default memo(AgentContent)
