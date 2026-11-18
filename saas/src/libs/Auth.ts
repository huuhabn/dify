export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  is_password_set?: boolean;
  interface_language?: string;
  theme?: string;
  timezone?: string;
  last_login_at?: number;
  created_at?: number;
};

export type Workspace = {
  id: string;
  name: string;
  plan?: string;
  status?: string;
  created_at?: number;
  role?: string;
  current?: boolean;
};

/**
 * Extract CSRF token from document cookies
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]!) : null;
}

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const res = await fetch('/console/api/account/profile', {
      headers,
      credentials: 'same-origin',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCurrentWorkspace(): Promise<Workspace | null> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const res = await fetch('/console/api/workspaces', {
      headers,
      credentials: 'same-origin',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const workspaces: Workspace[] = data?.workspaces || [];
    return workspaces.find((w) => w.current) || workspaces[0] || null;
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    await fetch('/console/api/logout', {
      method: 'POST',
      headers,
      credentials: 'same-origin',
    });
  } catch (err) {
    console.error('Failed to log out cleanly', err);
  }
}
