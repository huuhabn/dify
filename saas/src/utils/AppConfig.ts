import type { LocalePrefixMode } from 'next-intl/routing';

/** Locale prefix strategy for next-intl routing. */
const localePrefix: LocalePrefixMode = 'as-needed';

/** Centralized application configuration */
export const AppConfig = {
  name: 'Dify AI Agents SaaS',
  i18n: {
    locales: ['en', 'vi', 'zh-Hans'],
    defaultLocale: 'en',
    localePrefix,
  },
};
