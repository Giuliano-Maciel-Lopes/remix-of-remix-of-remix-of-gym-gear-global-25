/**
 * Authentication Context - JWT API only
 */

import React, { createContext, useContext } from 'react';
import { useApiAuth } from '@/hooks/useApiAuth';

interface User {
  id: string;
  email?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useApiAuth();

  const normalizedAuth: AuthContextType = {
    user: auth.user ? {
      id: auth.user.id,
      email: auth.user.email,
      role: auth.userRole || undefined,
    } : null,
    session: auth.session,
    loading: auth.loading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    userRole: auth.userRole,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
  };

  return (
    <AuthContext.Provider value={normalizedAuth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
