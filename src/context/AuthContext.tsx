'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import StudentPortalView from '../components/student/StudentPortalView';
import { LoginForm, PendingApprovalCard } from '../components/auth/LoginForm';
import { AuthUser } from '../types';

export type { AuthUser };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;
  timeLeftMs: number;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check current session from API or localStorage backup
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (data && data.authenticated && data.user) {
          setUser(data.user);
          setExpiresAt(data.expiresAt);
          setTimeLeftMs(data.timeLeftMs || 0);
          localStorage.setItem('tutorhq_user', JSON.stringify(data.user));
          localStorage.setItem('tutorhq_expiresAt', String(data.expiresAt));
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback: Check localStorage if cookie exists or token stored
      const storedUser = localStorage.getItem('tutorhq_user');
      const storedExpires = localStorage.getItem('tutorhq_expiresAt');
      if (storedUser && storedExpires) {
        const exp = Number(storedExpires);
        const remaining = exp - Date.now();
        if (remaining > 0) {
          setUser(JSON.parse(storedUser));
          setExpiresAt(exp);
          setTimeLeftMs(remaining);
          setIsLoading(false);
          return;
        }
      }

      // Expired or missing
      setUser(null);
      setExpiresAt(null);
      setTimeLeftMs(0);
      localStorage.removeItem('tutorhq_user');
      localStorage.removeItem('tutorhq_expiresAt');
    } catch (err) {
      // Silently fallback to local state without logging noisy fetch errors during server initialization
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Live session countdown timer & auto-logout when 3h expires
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        setUser(null);
        setExpiresAt(null);
        localStorage.removeItem('tutorhq_user');
        localStorage.removeItem('tutorhq_expiresAt');
        clearInterval(interval);
      } else {
        setTimeLeftMs(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const login = async (identifier: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, sid: identifier, email: identifier, password: pass }),
      });

      const resText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(resText);
      } catch (jsonErr) {
        return { 
          success: false, 
          error: 'Unable to connect to authentication server. Please try again in a few moments.' 
        };
      }

      if (!res.ok || !data.success) {
        const errText = data?.error || 'Invalid credentials or account pending approval.';
        return { success: false, error: errText };
      }

      setUser(data.user);
      setExpiresAt(data.expiresAt);
      setTimeLeftMs(data.expiresAt - Date.now());
      localStorage.setItem('tutorhq_user', JSON.stringify(data.user));
      localStorage.setItem('tutorhq_expiresAt', String(data.expiresAt));
      if (data.token) {
        localStorage.setItem('tutorhq_token', data.token);
      }

      return { success: true };
    } catch (err: any) {
      const rawMsg = err?.message || '';
      if (rawMsg.toLowerCase().includes('json') || rawMsg.toLowerCase().includes('unexpected token') || rawMsg.toLowerCase().includes('fetch')) {
        return { success: false, error: 'Unable to connect to authentication server. Please try again later.' };
      }
      return { success: false, error: rawMsg || 'Connection failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    } finally {
      setUser(null);
      setExpiresAt(null);
      setTimeLeftMs(0);
      localStorage.removeItem('tutorhq_user');
      localStorage.removeItem('tutorhq_expiresAt');
      localStorage.removeItem('tutorhq_token');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        expiresAt,
        timeLeftMs,
        login,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { LoginForm };

/* ==========================================
   AUTH GUARD WRAPPER
   ========================================== */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 font-mono">Verifying Session Authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // 1. Student View logic
  if (user?.userType === 'student') {
    // If account pending approval
    if (user.isApproved !== 'yes') {
      return <PendingApprovalCard user={user} />;
    }

    // Approved student view
    return <StudentPortalView />;
  }

  // 2. Admin View logic (userType === 'admin')
  return <>{children}</>;
}
