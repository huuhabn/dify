import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/** Isolates test-runner settings from the product's runtime configuration. */
export const testEnv = createEnv({
  server: {
    SAAS_VITEST_CHANNEL: z.string().optional(),
    SAAS_E2E_API_URL: z.url().default('http://localhost:5001'),
    SAAS_E2E_PORT: z.coerce.number().int().min(1024).max(65535).default(3008),
    SAAS_E2E_REUSE_SERVER: z.enum(['true', 'false']).default('false'),
    SAAS_E2E_CHANNEL: z.string().optional(),
    CI: z.string().optional(),
  },
  runtimeEnv: {
    SAAS_VITEST_CHANNEL: process.env.SAAS_VITEST_CHANNEL,
    SAAS_E2E_API_URL: process.env.SAAS_E2E_API_URL,
    SAAS_E2E_PORT: process.env.SAAS_E2E_PORT,
    SAAS_E2E_REUSE_SERVER: process.env.SAAS_E2E_REUSE_SERVER,
    SAAS_E2E_CHANNEL: process.env.SAAS_E2E_CHANNEL,
    CI: process.env.CI,
  },
});
