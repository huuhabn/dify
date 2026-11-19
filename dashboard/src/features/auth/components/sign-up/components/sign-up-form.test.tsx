import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';
import { type Locator } from 'vitest/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignUpForm } from './sign-up-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

function renderWithClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('SignUpForm', () => {
  let screen: RenderResult;
  let emailInput: Locator;
  let passwordInput: Locator;
  let confirmPasswordInput: Locator;
  let submitButton: Locator;

  beforeEach(async () => {
    vi.clearAllMocks();

    screen = await renderWithClient(<SignUpForm />);
    emailInput = screen.getByRole('textbox', { name: /^Email$/i });
    passwordInput = screen.getByLabelText(/^Password$/i);
    confirmPasswordInput = screen.getByLabelText(/^Confirm Password$/i);
    submitButton = screen.getByRole('button', { name: /^Create Account$/i });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders fields and submit button', async () => {
    await expect.element(emailInput).toBeInTheDocument();
    await expect.element(passwordInput).toBeInTheDocument();
    await expect.element(confirmPasswordInput).toBeInTheDocument();
    await expect.element(submitButton).toBeInTheDocument();
  });
});
