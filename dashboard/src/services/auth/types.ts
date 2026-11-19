export interface LoginPayload {
  email: string;
  password?: string;
  remember_me?: boolean;
  language?: string;
}

export interface LoginResponse {
  result: 'success' | 'fail';
  data: {
    access_token: string;
    refresh_token: string;
    token_type: 'bearer';
    expires_in: number;
  };
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  avatar_url: string | null;
  is_password_set: boolean;
  interface_language: string;
  interface_theme: 'light' | 'dark';
  timezone: string;
  last_login_at: string;
  last_active_at: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  status: string;
  role: 'owner' | 'admin' | 'editor' | 'dataset_operator' | 'member';
  created_at: number;
  current: boolean;
}

export interface WorkspacesResponse {
  workspaces: Workspace[];
}

export interface InitValidateResponse {
  status: 'not_started' | 'installing' | 'completed';
}

export interface SetupPayload {
  email: string;
  name: string;
  password: string;
  language: string;
}
