import Main from '@/components/dify/app/log-annotation'
import { PageType } from '@/components/dify/base/features/new-feature-panel/annotation-reply/type'

export default async function Page({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params
  return <Main appId={appId} pageType={PageType.log} />
}
