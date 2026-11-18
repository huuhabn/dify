import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/libs/I18nNavigation';

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignUpPage(props: SignUpPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h2 className="text-center text-2xl font-bold text-gray-900">Create an account</h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Registration is managed via your Dify workspace invitation.
      </p>
      <div className="mt-6 text-center">
        <Link
          href="/sign-in"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  );
}
