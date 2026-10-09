'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, DEMO_CREDENTIALS } from '../../lib/authContext';
import { api } from '../../lib/api';
import { Bell, LogOut, User, Check, Sparkles, MapPin, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, logout, quickDemoLogin, isDemo } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      } catch {
        // quiet fallback
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      // quiet
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-700 text-xl text-white shadow-sm font-bold">
              🍱
            </span>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                FoodBridge <span className="text-emerald-600 font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">AI</span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Waste Reduction & Hunger Relief</p>
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Demo Account Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Demo Persona</span>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (1-Click)
                </div>
                {(['donor', 'ngo', 'volunteer', 'admin'] as const).map((roleKey) => {
                  const cred = DEMO_CREDENTIALS[roleKey];
                  const isActive = user?.role.toLowerCase() === roleKey;
                  return (
                    <button
                      key={roleKey}
                      onClick={async () => {
                        setShowDemoMenu(false);
                        await quickDemoLogin(roleKey);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isActive ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="capitalize font-semibold">{roleKey}</div>
                        <div className="text-[10px] text-slate-500 truncate">{cred.label}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* Notification Popover */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">Notifications ({unreadCount} unread)</div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] font-medium text-emerald-600 hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 rounded-xl text-xs transition-colors ${
                              n.isRead ? 'bg-slate-50 text-slate-600' : 'bg-emerald-50/70 border border-emerald-100 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="font-semibold text-slate-800">{n.title}</div>
                            <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Pill */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px] flex items-center justify-end gap-1.5">
                    {user.name}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {user.role}
                    </span>
                    {isDemo ? (
                      <span
                        title="Demo Account: Data created during this session is stored only in your browser and will not alter MongoDB"
                        className="text-[9px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded cursor-help"
                      >
                        💾 Browser Storage
                      </span>
                    ) : (
                      <span
                        title="Main Account: Data is persisted directly to your MongoDB database"
                        className="text-[9px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-1.5 py-0.2 rounded cursor-help"
                      >
                        🍃 MongoDB Live
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-semibold px-3.5 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
