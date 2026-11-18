import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
  document.documentElement.removeAttribute('data-api-prefix');
  document.documentElement.removeAttribute('data-allow-embed');
});
afterEach(() => {
  vi.unstubAllEnvs();
  document.documentElement.removeAttribute('data-api-prefix');
  document.documentElement.removeAttribute('data-allow-embed');
});

describe('Browser runtime environment', () => {
  it('reads the injected API address instead of a build-time value', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_PREFIX', 'https://build.example/console/api');
    document.documentElement.dataset.apiPrefix = 'https://runtime.example/console/api';
    const { Env } = await import('../Env');
    expect(Env.NEXT_PUBLIC_API_PREFIX).toBe('https://runtime.example/console/api');
  });

  it('preserves disabled values from the HTML runtime configuration', async () => {
    document.documentElement.dataset.allowEmbed = '0';
    const { Env } = await import('../Env');
    expect(Env.NEXT_PUBLIC_ALLOW_EMBED).toBe(false);
  });

  it('rejects server-only access and prevents dataset rendering in the browser', async () => {
    const { Env, getDatasetMap } = await import('../Env');
    expect(() => Env.WEBAPP_ACCESS_PREFLIGHT_PROXY_SECRET).toThrow();
    expect(getDatasetMap).toThrow('getDatasetMap can only be called on the server');
  });
});
