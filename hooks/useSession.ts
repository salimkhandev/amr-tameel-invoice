'use client';

import { useState, useEffect } from 'react';
import { isClientAuthenticated, getClientSessionUser, loginClient, logoutClient, User } from '@/lib/auth';

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const authState = isClientAuthenticated();
    setIsAuthenticated(authState);
    if (authState) {
      setUser(getClientSessionUser());
    }
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string) => {
    const result = await loginClient(u, p);
    if (result.success) {
      setIsAuthenticated(true);
      setUser(result.user || { username: u, role: 'user' });
    }
    return result;
  };

  const logout = () => {
    logoutClient();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
  };
}
