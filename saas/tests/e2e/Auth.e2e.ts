import { expect, test } from '@playwright/test';
import { testEnv } from '../support/Env';

const apiURL = testEnv.SAAS_E2E_API_URL.replace(/\/$/, '');

test.describe('Anonymous Dify navigation', () => {
  test('opens the account bootstrap destination from Home', async ({ page, request }) => {
    const setup = await request.get(`${apiURL}/console/api/setup`);
    expect(setup.status()).toBe(200);
    const state = await setup.json();
    await page.goto('/');
    await expect(page).toHaveURL(state.step === 'finished' ? /\/signin(?:\?|$)/ : /\/(?:install|init)(?:\?|$)/);
    await expect(page.getByRole('textbox').first()).toBeVisible();
  });

  test('protects the console sign-in document from embedding', async ({ page }) => {
    const response = await page.goto('/signin');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-frame-options']).toBe('DENY');
    await expect(page.getByRole('textbox').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /(?:sign in|set up|verify)/i }).first()).toBeVisible();
  });
});
