import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm';

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'ForgotPassword',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function ForgotPasswordPage(props: ForgotPasswordPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ForgotPasswordForm />;
}
