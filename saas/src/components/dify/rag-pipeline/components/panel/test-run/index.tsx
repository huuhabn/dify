import DataSourceProvider from '@/components/dify/datasets/documents/create-from-pipeline/data-source/store/provider'
import { useStore } from '@/components/dify/workflow/store'
import Header from './header'
import Preparation from './preparation/index'
import Result from './result/index'

const TestRunPanel = () => {
  const isPreparingDataSource = useStore((state) => state.isPreparingDataSource)

  return (
    <div className="nokey relative flex h-full w-120 flex-col rounded-l-2xl border-y-[0.5px] border-l-[0.5px] border-components-panel-border bg-components-panel-bg shadow-xl shadow-shadow-shadow-1">
      <Header />
      {isPreparingDataSource ? (
        <DataSourceProvider>
          <Preparation />
        </DataSourceProvider>
      ) : (
        <Result />
      )}
    </div>
  )
}

export default TestRunPanel
