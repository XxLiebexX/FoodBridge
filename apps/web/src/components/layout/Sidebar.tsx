'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import {
  LayoutDashboard,
  PlusCircle,
  Package,
  Sparkles,
  MapPin,
  TrendingUp,
  Award,
  Users,
  Building2,
  FileText,
  ShieldCheck,
  HeartHandshake
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const role = user?.role || 'DONOR';

  const donorLinks = [
    { href: '/dashboard/donor', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/donor/create', label: 'Donate Food', icon: PlusCircle, highlight: true },
    { href: '/map', label: 'Live Rescue Map', icon: MapPin },
    { href: '/dashboard/ai', label: 'AI Surplus Forecast', icon: Sparkles },
    { href: '/analytics', label: 'Impact Analytics', icon: TrendingUp },
    { href: '/leaderboard', label: 'Leaderboard & Badges', icon: Award }
  ];

  const ngoLinks = [
    { href: '/dashboard/ngo', label: 'NGO Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/ngo/demand', label: 'Post Food Demand', icon: HeartHandshake },
    { href: '/map', label: 'Available Surplus Map', icon: MapPin },
    { href: '/dashboard/ai', label: 'AI Demand Forecast', icon: Sparkles },
    { href: '/analytics', label: 'Distribution Stats', icon: TrendingUp },
    { href: '/leaderboard', label: 'Impact Badges', icon: Award }
  ];

  const volunteerLinks = [
    { href: '/dashboard/volunteer', label: 'Active Deliveries', icon: LayoutDashboard },
    { href: '/map', label: 'Navigation Map', icon: MapPin },
    { href: '/leaderboard', label: 'Rescue Badges', icon: Award },
    { href: '/analytics', label: 'My Impact', icon: TrendingUp }
  ];

  const adminLinks = [
    { href: '/dashboard/admin', label: 'Admin Portal', icon: ShieldCheck },
    { href: '/map', label: 'City Operations Map', icon: MapPin },
    { href: '/dashboard/ai', label: 'AI Platform Forecast', icon: Sparkles },
    { href: '/analytics', label: 'Full System Analytics', icon: TrendingUp },
    { href: '/leaderboard', label: 'City Leaderboards', icon: Award }
  ];

  let links = donorLinks;
  if (role === 'NGO') links = ngoLinks;
  if (role === 'VOLUNTEER') links = volunteerLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-slate-200 bg-white/50 backdrop-blur-xs min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : link.highlight
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : link.highlight ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 px-3">
        <div className="p-3.5 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Matching Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
            Multi-factor scoring matches food within 15 km in under 3 minutes.
          </p>
        </div>
      </div>
    </aside>
  );
}
