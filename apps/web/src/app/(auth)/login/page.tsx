'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/authContext';
import { Button } from '../../../components/ui/Button';
import { Sparkles, Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'donor' | 'ngo' | 'volunteer' | 'admin') => {
    setError(null);
    setLoading(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 text-2xl mx-auto mb-3 shadow-xs font-bold">
            🍱
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to FoodBridge AI</h1>
          <p className="text-xs text-slate-500 mt-1">Manage donations, AI matches, and deliveries</p>
        </div>

        {/* Top Switcher: Sign In vs Sign Up */}
        <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
          <Link
            href="/login"
            className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-white text-emerald-800 shadow-xs"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="flex-1 py-2 text-center text-xs font-semibold rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts */}
        <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>1-Click Evaluator Demo Sign-In</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('donor')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition-colors text-left"
            >
              🍽️ Restaurant Donor
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ngo')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition-colors text-left"
            >
              🏠 Shelter NGO
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('volunteer')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition-colors text-left"
            >
              🚚 Volunteer
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-semibold shadow-2xs transition-colors text-left"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full py-2.5 mt-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-emerald-600 hover:underline">
            Create account (Sign Up)
          </Link>
        </p>
      </div>
    </div>
  );
}
