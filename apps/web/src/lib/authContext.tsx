'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';
import { demoStorage } from './demoStorage';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'DONOR' | 'NGO' | 'VOLUNTEER' | 'ADMIN';
  isVerified: boolean;
  organizationId?: string | null;
  organization?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isDemo: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  quickDemoLogin: (role: 'donor' | 'ngo' | 'volunteer' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_CREDENTIALS = {
  donor: { email: 'donor@foodbridge.ai', password: 'Password@123', label: 'Restaurant Donor' },
  ngo: { email: 'ngo@foodbridge.ai', password: 'Password@123', label: 'NGO Shelter' },
  volunteer: { email: 'volunteer@foodbridge.ai', password: 'Password@123', label: 'Delivery Volunteer' },
  admin: { email: 'admin@foodbridge.ai', password: 'Admin@123', label: 'System Admin' }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('foodbridge_token');
    const savedUser = localStorage.getItem('foodbridge_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        const demoActive = demoStorage.isDemoActive();
        setIsDemo(demoActive);
      } catch {
        localStorage.removeItem('foodbridge_token');
        localStorage.removeItem('foodbridge_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const isDemoEmail = email.toLowerCase().endsWith('@foodbridge.ai');
    
    // Authenticate with server
    const res = await api.post('/auth/login', { email, password: pass });
    localStorage.setItem('foodbridge_token', res.accessToken);
    localStorage.setItem('foodbridge_refreshToken', res.refreshToken);
    localStorage.setItem('foodbridge_user', JSON.stringify(res.user));

    // Configure storage mode: Demo accounts use browser localStorage only; Main accounts use MongoDB
    demoStorage.setDemoActive(isDemoEmail);
    setIsDemo(isDemoEmail);

    setToken(res.accessToken);
    setUser(res.user);

    // Redirect to respective dashboard
    redirectToDashboard(res.user.role);
  };

  const register = async (data: any) => {
    // Real user registration - ALWAYS persists directly to MongoDB
    demoStorage.setDemoActive(false);
    setIsDemo(false);

    const res = await api.post('/auth/register', data);
    localStorage.setItem('foodbridge_token', res.accessToken);
    localStorage.setItem('foodbridge_refreshToken', res.refreshToken);
    localStorage.setItem('foodbridge_user', JSON.stringify(res.user));

    setToken(res.accessToken);
    setUser(res.user);

    redirectToDashboard(res.user.role);
  };

  const logout = () => {
    localStorage.removeItem('foodbridge_token');
    localStorage.removeItem('foodbridge_refreshToken');
    localStorage.removeItem('foodbridge_user');
    demoStorage.setDemoActive(false);
    setIsDemo(false);
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const quickDemoLogin = async (role: 'donor' | 'ngo' | 'volunteer' | 'admin') => {
    const creds = DEMO_CREDENTIALS[role];
    demoStorage.setDemoActive(true);
    setIsDemo(true);
    await login(creds.email, creds.password);
  };

  const redirectToDashboard = (role: string) => {
    switch (role) {
      case 'DONOR':
        router.push('/dashboard/donor');
        break;
      case 'NGO':
        router.push('/dashboard/ngo');
        break;
      case 'VOLUNTEER':
        router.push('/dashboard/volunteer');
        break;
      case 'ADMIN':
        router.push('/dashboard/admin');
        break;
      default:
        router.push('/dashboard/donor');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isDemo, login, register, logout, quickDemoLogin }}>
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
