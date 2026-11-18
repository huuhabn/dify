import { setRequestLocale } from 'next-intl/server';
import { AppsView } from '@/components/AppsView';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AppsView />;
}
