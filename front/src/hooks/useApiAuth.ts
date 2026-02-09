/**
 * Authentication Hook for External Backend API
 * Replaces Supabase auth with JWT-based authentication
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi, setAuthToken, getAuthToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export function useApiAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      
      if (token) {
        try {
          const profile = await authApi.getProfile();
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role as 'admin' | 'user',
          });
        } catch (error) {
          // Token is invalid, clear it
          setAuthToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.register(email, password);
      setAuthToken(response.token);
      setUser(response.user);
      return { data: response, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setAuthToken(response.token);
      setUser(response.user);
      return { data: response, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    return { error: null };
  }, []);

  return {
    user,
    session: user ? { user } : null, // Compatibility with existing code
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    userRole: user?.role || null,
    signUp,
    signIn,
    signOut,
  };
}
