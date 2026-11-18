import type { ReactNode } from 'react'
import { OAuthRegistrationAnalytics } from '@/components/dify/oauth-registration-analytics'

export default function OAuthAuthorizeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <OAuthRegistrationAnalytics />
      {children}
    </>
  )
}
