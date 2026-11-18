'use client'
import type { Datasource } from '@/components/dify/rag-pipeline/components/panel/test-run/types'
import type { DataSourceNodeType } from '@/components/dify/workflow/nodes/data-source/types'
import type { Node } from '@/components/dify/workflow/types'
import { Separator } from '@langgenius/dify-ui/separator'
import { memo } from 'react'
import VectorSpaceFull from '@/components/dify/billing/vector-space-full'
import VectorSpaceUnavailable from '@/components/dify/billing/vector-space-unavailable'
import LocalFile from '@/components/dify/datasets/documents/create-from-pipeline/data-source/local-file'
import OnlineDocuments from '@/components/dify/datasets/documents/create-from-pipeline/data-source/online-documents'
import OnlineDrive from '@/components/dify/datasets/documents/create-from-pipeline/data-source/online-drive'
import WebsiteCrawl from '@/components/dify/datasets/documents/create-from-pipeline/data-source/website-crawl'
import { DatasourceType } from '@/types/dify/pipeline'
import UpgradeCard from '../../../create/step-one/upgrade-card'
import Actions from '../actions/index'
import DataSourceOptions from '../data-source-options/index'

type StepOneContentProps = {
  datasource: Datasource | undefined
  datasourceType: string | undefined
  pipelineNodes: Node<DataSourceNodeType>[]
  supportBatchUpload: boolean
  showBatchUploadUpgrade: boolean
  isShowVectorSpaceFull: boolean
  isShowVectorSpaceUnavailable: boolean
  isRetryingVectorSpace: boolean
  showSelect: boolean
  totalOptions: number | undefined
  selectedOptions: number | undefined
  tip: string
  nextBtnDisabled: boolean
  onSelectDataSource: (dataSource: Datasource) => void
  onCredentialChange: (credentialId: string) => void
  onSelectAll: (checked: boolean) => void
  onRetryVectorSpace: () => void
  onNextStep: () => void
}

const StepOneContent = ({
  datasource,
  datasourceType,
  pipelineNodes,
  supportBatchUpload,
  showBatchUploadUpgrade,
  isShowVectorSpaceFull,
  isShowVectorSpaceUnavailable,
  isRetryingVectorSpace,
  showSelect,
  totalOptions,
  selectedOptions,
  tip,
  nextBtnDisabled,
  onSelectDataSource,
  onCredentialChange,
  onSelectAll,
  onRetryVectorSpace,
  onNextStep,
}: StepOneContentProps) => {
  const showUpgradeCard = showBatchUploadUpgrade && datasourceType === DatasourceType.localFile

  return (
    <div className="flex flex-col gap-y-5 pt-4">
      <DataSourceOptions
        datasourceNodeId={datasource?.nodeId || ''}
        onSelect={onSelectDataSource}
        pipelineNodes={pipelineNodes}
      />
      {datasourceType === DatasourceType.localFile && (
        <LocalFile
          allowedExtensions={datasource!.nodeData.fileExtensions || []}
          supportBatchUpload={supportBatchUpload}
        />
      )}
      {datasourceType === DatasourceType.onlineDocument && (
        <OnlineDocuments
          nodeId={datasource!.nodeId}
          nodeData={datasource!.nodeData}
          onCredentialChange={onCredentialChange}
        />
      )}
      {datasourceType === DatasourceType.websiteCrawl && (
        <WebsiteCrawl
          nodeId={datasource!.nodeId}
          nodeData={datasource!.nodeData}
          onCredentialChange={onCredentialChange}
        />
      )}
      {datasourceType === DatasourceType.onlineDrive && (
        <OnlineDrive
          nodeId={datasource!.nodeId}
          nodeData={datasource!.nodeData}
          onCredentialChange={onCredentialChange}
        />
      )}
      {isShowVectorSpaceFull && <VectorSpaceFull />}
      {isShowVectorSpaceUnavailable && (
        <VectorSpaceUnavailable isRetrying={isRetryingVectorSpace} onRetry={onRetryVectorSpace} />
      )}
      <Actions
        showSelect={showSelect}
        totalOptions={totalOptions}
        selectedOptions={selectedOptions}
        onSelectAll={onSelectAll}
        disabled={nextBtnDisabled}
        handleNextStep={onNextStep}
        tip={tip}
      />
      {showUpgradeCard && (
        <>
          <Separator orientation="horizontal" className="my-4 bg-divider-subtle" />
          <UpgradeCard />
        </>
      )}
    </div>
  )
}

export default memo(StepOneContent)
