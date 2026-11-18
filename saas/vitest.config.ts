import { fileURLToPath } from 'node:url';
import { openapi } from '@dify/openapi-content-mapper/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { loadEnv } from 'vite';
import { configDefaults, defineConfig } from 'vitest/config';
import { testEnv } from './tests/support/Env';
import { legacyExcludes, testPatterns, unitExcludes } from './scripts/test-projects.ts';

const sourceRoot = fileURLToPath(new URL('./src/', import.meta.url));
const browserProvider = playwright({
  launchOptions: testEnv.SAAS_VITEST_CHANNEL ? { channel: testEnv.SAAS_VITEST_CHANNEL } : {},
});

export default defineConfig({
  plugins: [
    openapi(),
    {
      name: 'saas-next-static-images',
      enforce: 'pre',
      load(id) {
        if (/[?&](?:raw|url)\b/.test(id)) return null;
        const file = id.split('?')[0];
        if (!file.startsWith(sourceRoot) || !/\.(?:svg|png|jpe?g|gif)$/i.test(file)) return null;
        return `export default { src: ${JSON.stringify(`/__static__/${file.slice(sourceRoot.length)}`)} }`;
      },
    },
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    dedupe: ['vitest', '@vitest/runner', '@vitest/expect', 'react', 'react-dom'],
    alias: [
      { find: /^@\/public\//, replacement: fileURLToPath(new URL('./public/', import.meta.url)) },
      { find: /^@\//, replacement: sourceRoot },
      { find: /^~@\//, replacement: sourceRoot },
      { find: '#i18n', replacement: `${sourceRoot}i18n/lib.client.ts` },
    ],
  },
  test: {
    maxWorkers: 2,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: ['src/**/*.{spec,test,stories}.{js,jsx,ts,tsx}', 'src/test/**', '**/*.d.ts'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: testPatterns.unit,
          exclude: [...configDefaults.exclude, ...unitExcludes],
          environment: 'node',
          globals: true,
        },
      },
      {
        extends: true,
        test: {
          name: 'legacy',
          include: testPatterns.legacy,
          exclude: [...configDefaults.exclude, ...legacyExcludes],
          environment: 'happy-dom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      ...(['browser', 'ui'] as const).map((name) => ({
        extends: true as const,
        plugins: [tailwindcss()],
        optimizeDeps: {
          exclude: ['vitest', 'vitest/browser', 'vitest-browser-react'],
          include: ['@t3-oss/env-nextjs', 'next/dynamic', 'react-i18next', 'string-ts', 'zod'],
        },
        define: { 'process.env': '{}' },
        test: {
          name,
          globals: true,
          include: testPatterns[name],
          setupFiles: ['./vitest.browser.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: browserProvider,
            instances: [{ browser: 'chromium' as const }],
          },
        },
      })),
    ],
    reporters: ['default'],
    env: loadEnv('test', fileURLToPath(new URL('./', import.meta.url)), 'NEXT_PUBLIC_'),
  },
});
