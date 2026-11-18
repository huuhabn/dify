import { defineConfig, devices } from '@playwright/test';
import { testEnv } from './tests/support/Env';

const baseURL = `http://localhost:${testEnv.SAAS_E2E_PORT}`;
const apiURL = testEnv.SAAS_E2E_API_URL.replace(/\/$/, '');

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.{integ,e2e}.ts',
  fullyParallel: false,
  workers: 2,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  forbidOnly: Boolean(testEnv.CI),
  reporter: testEnv.CI ? 'github' : 'list',
  webServer: {
    command: testEnv.CI ? 'pnpm start' : 'pnpm dev',
    url: `${baseURL}/signin`,
    timeout: 240_000,
    reuseExistingServer: testEnv.SAAS_E2E_REUSE_SERVER === 'true' && !testEnv.CI,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 10_000 },
    env: {
      PORT: String(testEnv.SAAS_E2E_PORT),
      SAAS_OUTPUT_DIR: testEnv.CI ? '.next' : '.next-e2e',
      NODE_OPTIONS: '--max-old-space-size=4096',
      BROWSER_TO_TERMINAL_DISABLED: 'true',
      NEXT_PUBLIC_SENTRY_DISABLED: 'true',
      NEXT_PUBLIC_ENABLE_AGENTATION: 'false',
      NEXT_PUBLIC_APP_URL: baseURL,
      CONSOLE_API_URL: apiURL,
      SERVER_CONSOLE_API_URL: apiURL,
      NEXT_PUBLIC_API_PREFIX: `${apiURL}/console/api`,
      NEXT_PUBLIC_PUBLIC_API_PREFIX: `${apiURL}/api`,
    },
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: testEnv.SAAS_E2E_CHANNEL ? { channel: testEnv.SAAS_E2E_CHANNEL } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
