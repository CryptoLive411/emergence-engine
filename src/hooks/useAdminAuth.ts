import { useState, useEffect } from 'react';

const ADMIN_SESSION_KEY = 'genesis_admin_session';
const SESSION_DURATION = 1000 * 60 * 60; // 1 hour

interface AdminSession {
  authenticated: boolean;
  expiresAt: number;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const session = localStorage.getItem(ADMIN_SESSION_KEY);
      if (session) {
        const parsed: AdminSession = JSON.parse(session);
        if (parsed.authenticated && parsed.expiresAt > Date.now()) {
          setIsAuthenticated(true);
        } else {
          // Session expired
          localStorage.removeItem(ADMIN_SESSION_KEY);
          setIsAuthenticated(false);
        }
      }
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    setIsLoading(false);
  };

  const authenticate = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/world-control`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ action: 'verify-admin', password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const session: AdminSession = {
          authenticated: true,
          expiresAt: Date.now() + SESSION_DURATION,
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, error: data.error || 'Invalid password' };
    } catch (error) {
      return { success: false, error: 'Failed to authenticate' };
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    authenticate,
    logout,
  };
}
