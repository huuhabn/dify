import type { FileUploadStrategy } from '@/components/dify/base/file-uploader/upload-context'
import { uploadHumanInputFormLocalFile, uploadHumanInputFormRemoteFileInfo } from '@/service/share'

export const createLegacyFormUploadStrategy = (formToken: string): FileUploadStrategy => ({
  uploadLocal: (params) => {
    void uploadHumanInputFormLocalFile({ formToken, ...params })
  },
  uploadRemote: (url) => uploadHumanInputFormRemoteFileInfo(formToken, url),
})
