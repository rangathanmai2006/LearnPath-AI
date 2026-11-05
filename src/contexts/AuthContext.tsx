import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  level: number;
  xp: number;
  target_goal: string;
  daily_goal_minutes: number;
  streak_days: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendOnline: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('learnpath_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const checkAuth = async () => {
    setIsLoading(true);
    let storedToken = localStorage.getItem('learnpath_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setBackendOnline(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      setToken(storedToken);
      setBackendOnline(true);
    } catch {
      localStorage.removeItem('learnpath_token');
      localStorage.removeItem('learnpath_user');
      setUser(null);
      setToken(null);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('learnpath_token');
      localStorage.removeItem('learnpath_user');
      setToken(null);
      setUser(null);
      setBackendOnline(true);
    };
    window.addEventListener('learnpath:unauthorized', handleUnauthorized);
    checkAuth();
    return () => window.removeEventListener('learnpath:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string) => {
    sessionStorage.removeItem('logged_out');
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('learnpath_token', access_token);
      localStorage.setItem('learnpath_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      setBackendOnline(true);
    } catch (err: any) {
      if (!err.response) setBackendOnline(false);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    sessionStorage.removeItem('logged_out');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('learnpath_token', access_token);
      localStorage.setItem('learnpath_user', JSON.stringify(userData));
      setToken(access_token);
      setUser(userData);
      setBackendOnline(true);
    } catch (err: any) {
      if (!err.response) setBackendOnline(false);
      throw err;
    }
  };

  const logout = () => {
    sessionStorage.setItem('logged_out', 'true');
    localStorage.removeItem('learnpath_token');
    localStorage.removeItem('learnpath_user');
    localStorage.removeItem('learnpath_cached_paths');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('learnpath_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        backendOnline,
        login,
        register,
        logout,
        updateUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
