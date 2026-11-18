import DatasetAccessConfigPage from '@/components/dify/datasets/access-config'

type Props = {
  params: Promise<{ datasetId: string }>
}

const AccessConfig = async (props: Props) => {
  const params = await props.params

  const { datasetId } = params

  return <DatasetAccessConfigPage datasetId={datasetId} />
}

export default AccessConfig
