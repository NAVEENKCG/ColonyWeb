import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

const STORAGE_KEY_CURRENT = 'colony_connect_current_user_v1';
const STORAGE_KEY_TOKEN = 'colony_connect_session_token_v1';

interface AuthContextType {
  currentUser: User | null;
  register: (user: User, otp: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<User>;
  lookupUser: (phone: string) => Promise<User | null>;
  sendOtp: (phone: string, purpose: 'login' | 'register') => Promise<{ demoCode?: string }>;
  logout: () => void;
  updateUser: (user: User) => Promise<void>;
  secureFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return fallback;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEY_CURRENT, null)
  );
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY_TOKEN)
  );

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    }
  }, [currentUser]);

  useEffect(() => {
    if (sessionToken) {
      localStorage.setItem(STORAGE_KEY_TOKEN, sessionToken);
    } else {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
    }
  }, [sessionToken]);

  // Validate existing session on mount
  useEffect(() => {
    if (sessionToken && currentUser) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${sessionToken}` },
      })
        .then((res) => {
          if (!res.ok) {
            // Session expired or invalid — force logout
            setCurrentUser(null);
            setSessionToken(null);
          }
        })
        .catch(() => {
          // Network error — keep session for now, will fail on next API call
        });
    }
  }, []); // Only on mount

  /**
   * Centralized secure fetch wrapper.
   * Automatically attaches the Authorization header and handles 401 by forcing logout.
   */
  const secureFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const headers = new Headers(options.headers || {});

      if (sessionToken) {
        headers.set('Authorization', `Bearer ${sessionToken}`);
      }

      // Default Content-Type for JSON bodies
      if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle expired sessions globally
      if (response.status === 401) {
        setCurrentUser(null);
        setSessionToken(null);
      }

      return response;
    },
    [sessionToken]
  );

  /**
   * Request OTP to be sent to a phone number.
   */
  const sendOtp = useCallback(
    async (phone: string, purpose: 'login' | 'register'): Promise<{ demoCode?: string }> => {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to send OTP');
      }

      const data = await res.json();
      return { demoCode: data.demoCode };
    },
    []
  );

  /**
   * Register a new user with server-side OTP verification.
   */
  const register = useCallback(async (user: User, otp: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, otp }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to register');
    }

    const data = await res.json();
    setSessionToken(data.token);
    setCurrentUser(data.user);
  }, []);

  /**
   * Lookup a user by phone for the login preview (minimal info returned).
   */
  const lookupUser = useCallback(async (phone: string): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  /**
   * Login with server-side OTP verification.
   */
  const login = useCallback(async (phone: string, otp: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await res.json();
    setSessionToken(data.token);
    setCurrentUser(data.user);
    return data.user;
  }, []);

  /**
   * Logout — invalidate server session and clear local storage.
   */
  const logout = useCallback(() => {
    if (sessionToken) {
      // Fire-and-forget server logout
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
    setSessionToken(null);
    setCurrentUser(null);
  }, [sessionToken]);

  /**
   * Update user profile (e.g. role switch).
   */
  const updateUser = useCallback(
    async (user: User) => {
      const res = await secureFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: user.role }),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
      }
    },
    [secureFetch]
  );

  return (
    <AuthContext.Provider
      value={{ currentUser, register, login, lookupUser, sendOtp, logout, updateUser, secureFetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
