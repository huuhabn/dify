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
};

export async function fetchUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await fetch('/console/api/account/profile', {
      headers: {
        'Content-Type': 'application/json',
      },
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
    const res = await fetch('/console/api/workspaces/current', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/console/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('Failed to log out cleanly', err);
  }
}
