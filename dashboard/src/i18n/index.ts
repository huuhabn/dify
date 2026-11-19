'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import Cookies from 'js-cookie';
import { defaultResources } from './resources';

export const SUPPORTED_LOCALES = [
  'en-US',
  'zh-Hans',
  'zh-Hant',
  'ja-JP',
  'ko-KR',
  'es-ES',
  'fr-FR',
  'de-DE',
  'pt-BR',
  'ru-RU',
  'vi-VN'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE = 'en-US';
export const LOCALE_COOKIE_NAME = 'locale';

export function getSavedLocale(): string {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const cookieLocale = Cookies.get(LOCALE_COOKIE_NAME);
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as any)) {
    return cookieLocale;
  }
  return DEFAULT_LOCALE;
}

if (!i18n.isInitialized) {
  i18n
    .use(
      resourcesToBackend((language: string, namespace: string) => {
        return import(`./locales/${language}/${namespace}.json`);
      })
    )
    .use(initReactI18next)
    .init({
      lng: getSavedLocale(),
      fallbackLng: DEFAULT_LOCALE,
      resources: defaultResources,
      defaultNS: 'common',
      ns: ['common', 'login', 'app', 'dataset', 'tools', 'explore', 'custom', 'workflow'],
      interpolation: {
        escapeValue: false
      },
      react: {
        useSuspense: false
      }
    });
}

export default i18n;
