import { setRequestLocale } from 'next-intl/server';

export default async function UserProfilePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="my-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
        <p className="mt-2 text-sm text-gray-600">
          User profile management integrated with Dify workspace settings.
        </p>
      </div>
    </div>
  );
}
