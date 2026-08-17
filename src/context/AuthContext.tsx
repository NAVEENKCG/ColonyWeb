import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';

const STORAGE_KEY_USERS = 'colony_connect_registered_users_v1';
const STORAGE_KEY_CURRENT = 'colony_connect_current_user_v1';

interface AuthContextType {
  currentUser: User | null;
  registeredUsers: User[];
  register: (user: User) => void;
  login: (phone: string) => User | null;
  logout: () => void;
  updateUser: (user: User) => void;
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
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() =>
    loadFromStorage<User[]>(STORAGE_KEY_USERS, [])
  );

  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    loadFromStorage<User | null>(STORAGE_KEY_CURRENT, null)
  );

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT);
    }
  }, [currentUser]);

  const register = useCallback((user: User) => {
    setRegisteredUsers((prev) => {
      // Replace if phone already exists, otherwise add
      const exists = prev.findIndex((u) => u.phone === user.phone);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = user;
        return updated;
      }
      return [...prev, user];
    });
    setCurrentUser(user);
  }, []);

  const login = useCallback(
    (phone: string): User | null => {
      const found = registeredUsers.find((u) => u.phone === phone);
      if (found) {
        setCurrentUser(found);
        return found;
      }
      return null;
    },
    [registeredUsers]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateUser = useCallback((user: User) => {
    setCurrentUser(user);
    setRegisteredUsers((prev) =>
      prev.map((u) => (u.phone === user.phone ? user : u))
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentUser, registeredUsers, register, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
