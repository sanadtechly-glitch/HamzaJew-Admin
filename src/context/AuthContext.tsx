import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, type User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    const token = localStorage.getItem('jewelry_hamza_admin_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const u = await api.me();
      if (u.role === 'CUSTOMER') {
        throw new Error('غير مصرح بالدخول للعملاء، هذه لوحة تحكم الإدارة فقط');
      }
      setUser(u);
    } catch (err: any) {
      console.error('Auth check failed:', err);
      api.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (phone: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await api.login(phone, pass);
      if (u.role === 'CUSTOMER') {
        api.logout();
        throw new Error('غير مصرح بالدخول للعملاء، هذه لوحة تحكم الإدارة فقط');
      }
      setUser(u);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
