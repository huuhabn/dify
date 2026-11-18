import { expect, test } from '@playwright/test';
import { testEnv } from '../support/Env';

const apiURL = testEnv.SAAS_E2E_API_URL.replace(/\/$/, '');

test.describe('Dify backend readiness', () => {
  test('returns a healthy API without requiring a frontend database', async ({ request }) => {
    const response = await request.get(`${apiURL}/health`);
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: 'ok' });
  });

  test('exposes public system features for anonymous bootstrap', async ({ request }) => {
    const response = await request.get(`${apiURL}/console/api/system-features`);
    expect(response.status()).toBe(200);
    const features = await response.json();
    expect(['COMMUNITY', 'ENTERPRISE', 'CLOUD']).toContain(features.deployment_edition);
  });
});
