import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { InstallForm } from '@/components/InstallForm';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Install',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function InstallPage() {
  return <InstallForm />;
}
