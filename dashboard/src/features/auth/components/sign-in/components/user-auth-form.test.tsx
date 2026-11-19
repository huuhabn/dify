import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, type RenderResult } from 'vitest-browser-react';
import { type Locator, userEvent } from 'vitest/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserAuthForm } from './user-auth-form';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(),
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

describe('UserAuthForm', () => {
  let screen: RenderResult;
  let emailInput: Locator;
  let passwordInput: Locator;
  let submitButton: Locator;

  beforeEach(async () => {
    vi.clearAllMocks();

    screen = await renderWithClient(<UserAuthForm />);
    emailInput = screen.getByRole('textbox', { name: /^Email$/i });
    passwordInput = screen.getByLabelText(/^Password$/i);
    submitButton = screen.getByRole('button', { name: /^Sign in$/i });
  });

  it('renders email and password inputs and submit button', async () => {
    await expect.element(emailInput).toBeInTheDocument();
    await expect.element(passwordInput).toBeInTheDocument();
    await expect.element(submitButton).toBeInTheDocument();
  });
});
