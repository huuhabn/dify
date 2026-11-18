'use client';

import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';
import { Link } from '@/libs/I18nNavigation';

type Step = 'email' | 'code' | 'password' | 'success';

const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export function ForgotPasswordForm() {
  const t = useTranslations('ForgotPassword');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Submit email to get verification code
  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.result !== 'success') {
        setError(data?.message || t('error_default'));
        setLoading(false);
        return;
      }

      setToken(data.data || '');
      setStep('code');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_default'));
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (loading) return;
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

      const data = await response.json().catch(() => ({}));
      if (response.ok && data.result === 'success') {
        setToken(data.data || '');
      } else {
        setError(data?.message || t('error_default'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_default'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit code
  const handleCodeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/console/api/forgot-password/validity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: code.trim(),
          token,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.is_valid) {
        setError(data?.message || t('error_default'));
        setLoading(false);
        return;
      }

      setToken(data.token || '');
      setStep('password');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_default'));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set new password
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      setError(t('password_invalid'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/console/api/forgot-password/resets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          new_password: newPassword,
          password_confirm: confirmPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.result !== 'success') {
        setError(data?.message || t('error_default'));
        setLoading(false);
        return;
      }

      setStep('success');
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

        {step === 'email' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>
          </>
        )}

        {step === 'code' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t('code_title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('code_subtitle', { email })}
            </p>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t('new_password_title')}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t('new_password_subtitle')}
            </p>
          </>
        )}

        {step === 'success' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {t('reset_success_title')}
            </h1>
          </>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Input Email */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {t('back_to_sign_in')}
            </Link>
          </div>
        </form>
      )}

      {/* Step 2: Input Verification Code */}
      {step === 'code' && (
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              {t('code_label')}
            </label>
            <input
              id="code"
              type="text"
              required
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('code_placeholder')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.trim().length === 0}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? t('verifying_button') : t('verify_button')}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {t('resend_code')}
            </button>
            <Link
              href="/sign-in"
              className="font-medium text-gray-500 hover:text-gray-700"
            >
              {t('back_to_sign_in')}
            </Link>
          </div>
        </form>
      )}

      {/* Step 3: Input New Password */}
      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700"
            >
              {t('new_password_label')}
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoFocus
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('new_password_placeholder')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700"
            >
              {t('confirm_password_label')}
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('confirm_password_placeholder')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? t('reset_submitting_button') : t('reset_button')}
          </button>
        </form>
      )}

      {/* Step 4: Success */}
      {step === 'success' && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-sm text-green-800">
          <p className="font-semibold">{t('reset_success_title')}</p>
          <p className="mt-1 text-green-700">{t('reset_success_message')}</p>
          <div className="mt-4">
            <Link
              href="/sign-in"
              className="inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 transition-colors"
            >
              {t('back_to_sign_in')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
