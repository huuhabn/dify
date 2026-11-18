import * as React from 'react'
import Main from '@/components/dify/share/text-generation'
import AuthenticatedLayout from '../../components/authenticated-layout'

const Completion = () => {
  return (
    <AuthenticatedLayout>
      <Main />
    </AuthenticatedLayout>
  )
}

export default React.memo(Completion)
