'use client';
import React, { useEffect } from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';
import '@/i18n'; // Initialize i18n
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        <QueryProvider>{children}</QueryProvider>
      </ActiveThemeProvider>
    </I18nextProvider>
  );
}
