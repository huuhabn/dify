import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => vi.resetModules());
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('Server environment', () => {
  it('shares one instance between the canonical and compatibility entrypoints', async () => {
    const canonical = await import('../Env');
    const compatibility = await import('@/env');
    expect(canonical.Env).toBe(canonical.env);
    expect(compatibility.env).toBe(canonical.Env);
    expect(compatibility.getDatasetMap).toBe(canonical.getDatasetMap);
  });

  it.each(['false', '0'])('preserves a disabled public boolean encoded as %s', async (value) => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_EMBED', value);
    const { Env, getDatasetMap } = await import('../Env');
    expect(Env.NEXT_PUBLIC_ALLOW_EMBED).toBe(false);
    expect(getDatasetMap()).toHaveProperty('data-allow-embed', false);
  });

  it('keeps server credentials out of the public runtime dataset', async () => {
    vi.stubEnv('WEBAPP_ACCESS_PREFLIGHT_PROXY_SECRET', 'fixture-server-only-secret');
    const { Env, getDatasetMap } = await import('../Env');
    expect(Env.WEBAPP_ACCESS_PREFLIGHT_PROXY_SECRET).toBe('fixture-server-only-secret');
    const dataset = getDatasetMap();
    expect(dataset).not.toHaveProperty('data-webapp-access-preflight-proxy-secret');
    expect(JSON.stringify(dataset)).not.toContain('fixture-server-only-secret');
  });

  it('rejects malformed public configuration before rendering', async () => {
    vi.stubEnv('NEXT_PUBLIC_ALLOW_EMBED', 'invalid-boolean');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(import('../Env')).rejects.toThrow();
  });
});
