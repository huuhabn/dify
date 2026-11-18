import type { TagType } from '@dify/contracts/api/console/tags/types.gen'
import type { PermissionKey } from '@/types/dify/access-control'
import { SnippetPermission } from '@/components/dify/snippets/utils/permission'

export const getTagManagePermissionKey = (type: TagType): PermissionKey => {
  if (type === 'app') return 'app.tag.manage'

  if (type === 'snippet') return SnippetPermission.CreateAndModify

  return 'dataset.tag.manage'
}
