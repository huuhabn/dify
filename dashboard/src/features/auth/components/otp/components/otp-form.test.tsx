import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';
import { type Locator, userEvent } from 'vitest/browser';
import { OtpForm } from './otp-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
}));

describe('OtpForm', () => {
  let screen: RenderResult;
  let otpInput: Locator;
  let verifyButton: Locator;

  beforeEach(async () => {
    vi.clearAllMocks();

    screen = await render(<OtpForm />);
    otpInput = screen.getByLabelText(/^One-Time Password$/i);
    verifyButton = screen.getByRole('button', { name: /^Verify$/i });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('disables Verify until 6 digits are entered', async () => {
    await expect.element(verifyButton).toBeDisabled();

    await userEvent.fill(otpInput, '12345');
    await expect.element(verifyButton).toBeDisabled();

    await userEvent.fill(otpInput, '123456');
    await expect.element(verifyButton).toBeEnabled();
  });
});
