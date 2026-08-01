'use client';

import { useState, useEffect } from 'react';
import { isClientAuthenticated, getClientSessionUser, loginClient, logoutClient } from '@/lib/auth';

export function useSession() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const authState = isClientAuthenticated();
    setIsAuthenticated(authState);
    if (authState) {
      setUser(getClientSessionUser());
    }
    setIsLoading(false);
  }, []);

  const login = (u: string, p: string) => {
    const success = loginClient(u, p);
    if (success) {
      setIsAuthenticated(true);
      setUser(u);
    }
    return success;
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
