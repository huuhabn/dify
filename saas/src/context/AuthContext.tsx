'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  fetchCurrentWorkspace,
  fetchUserProfile,
  logoutUser,
  type UserProfile,
  type Workspace,
} from '@/libs/Auth';
import { useRouter } from '@/libs/I18nNavigation';

type AuthContextType = {
  user: UserProfile | null;
  workspace: Workspace | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  workspace: null,
  isLoading: true,
  logout: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadAuth = async () => {
    try {
      const [userProfile, currentWs] = await Promise.all([
        fetchUserProfile(),
        fetchCurrentWorkspace(),
      ]);
      setUser(userProfile);
      setWorkspace(currentWs);
    } catch {
      setUser(null);
      setWorkspace(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();
  }, []);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setWorkspace(null);
    router.push('/sign-in');
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        isLoading,
        logout,
        refreshAuth: loadAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
