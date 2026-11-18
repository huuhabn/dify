'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ChangeEventHandler } from 'react';
import { usePathname, useRouter } from '@/libs/I18nNavigation';
import { routing } from '@/libs/I18nRouting';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN (English)',
  vi: 'VI (Tiếng Việt)',
  fr: 'FR (Français)',
  ar: 'AR (العربية)',
};

export const LocaleSwitcher = () => {
  const t = useTranslations('LocaleSwitcher');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const newLocale = event.target.value;

    if (newLocale === locale) {
      return;
    }

    const { search } = window.location;
    router.push(`${pathname}${search}`, { locale: newLocale, scroll: false });
  };

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none cursor-pointer transition-colors"
      aria-label={t('change_language')}
    >
      {routing.locales.map((elt) => (
        <option key={elt} value={elt}>
          {LOCALE_LABELS[elt] || elt.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
