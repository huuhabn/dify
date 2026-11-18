'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Link } from '@/libs/I18nNavigation';

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPassword');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/console/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.message || t('error_default'));
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_default'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
      </div>

      {submitted ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
          <p className="font-semibold">{t('success_title')}</p>
          <p className="mt-1">{t('success_message', { email })}</p>
          <div className="mt-4">
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('back_to_sign_in')}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t('email_label')}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('email_placeholder')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
            >
              {loading ? t('submitting_button') : t('submit_button')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <Link
              href="/sign-in"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {t('back_to_sign_in')}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
