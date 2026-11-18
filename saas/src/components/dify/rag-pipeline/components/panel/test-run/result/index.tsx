import { TabsPanel, Tabs as TabsRoot } from '@langgenius/dify-ui/tabs'
import { memo, useState } from 'react'
import { LoadingPlaceholder } from '@/components/dify/base/loading-placeholder'
import ResultPanel from '@/components/dify/workflow/run/result-panel'
import TracingPanel from '@/components/dify/workflow/run/tracing-panel'
import { useStore } from '@/components/dify/workflow/store'
import { WorkflowRunningStatus } from '@/components/dify/workflow/types'
import ResultPreview from './result-preview/index'
import Tabs from './tabs/index'

const Result = () => {
  const workflowRunningData = useStore((s) => s.workflowRunningData)
  const [currentTab, setCurrentTab] = useState<string>('RESULT')

  const switchTab = async (tab: string) => {
    setCurrentTab(tab)
  }

  return (
    <TabsRoot value={currentTab} onValueChange={setCurrentTab} className="flex grow flex-col">
      <Tabs workflowRunningData={workflowRunningData} />
      <div className="flex h-0 grow flex-col overflow-y-auto">
        <TabsPanel value="RESULT" className="flex grow flex-col">
          <ResultPreview
            isRunning={
              !workflowRunningData?.result ||
              workflowRunningData?.result.status === WorkflowRunningStatus.Running
            }
            outputs={workflowRunningData?.result?.outputs}
            error={workflowRunningData?.result?.error}
            onSwitchToDetail={() => switchTab('DETAIL')}
          />
        </TabsPanel>
        <TabsPanel value="DETAIL" className="flex grow flex-col">
          <ResultPanel
            inputs={workflowRunningData?.result?.inputs}
            outputs={workflowRunningData?.result?.outputs}
            status={workflowRunningData?.result?.status || ''}
            error={workflowRunningData?.result?.error}
            elapsed_time={workflowRunningData?.result?.elapsed_time}
            total_tokens={workflowRunningData?.result?.total_tokens}
            created_at={workflowRunningData?.result?.created_at}
            created_by={(workflowRunningData?.result?.created_by as any)?.name}
            steps={workflowRunningData?.result?.total_steps}
            exceptionCounts={workflowRunningData?.result?.exceptions_count}
          />
          {!workflowRunningData?.result && (
            <div className="flex grow items-center justify-center">
              <LoadingPlaceholder />
            </div>
          )}
        </TabsPanel>
        <TabsPanel value="TRACING" className="flex grow flex-col">
          <TracingPanel
            className="bg-background-section-burn"
            list={workflowRunningData?.tracing || []}
          />
          {!workflowRunningData?.tracing?.length && (
            <div className="flex grow items-center justify-center">
              <LoadingPlaceholder />
            </div>
          )}
        </TabsPanel>
      </div>
    </TabsRoot>
  )
}

export default memo(Result)
