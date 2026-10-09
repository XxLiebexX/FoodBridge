import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-sm">
            🍱
          </span>
          <span className="text-base font-bold text-slate-900">FoodBridge AI</span>
          <span className="text-xs text-slate-400">| Turn Surplus Food Into Someone&apos;s Next Meal</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
          <Link href="/map" className="hover:text-emerald-600 transition-colors">Rescue Map</Link>
          <Link href="/analytics" className="hover:text-emerald-600 transition-colors">Live Impact</Link>
          <Link href="/dashboard/ai" className="hover:text-emerald-600 transition-colors">AI Predictions</Link>
          <Link href="/leaderboard" className="hover:text-emerald-600 transition-colors">Leaderboard</Link>
          <a href="http://localhost:5001/api/docs" target="_blank" rel="noreferrer" className="hover:text-emerald-600 transition-colors">
            API Docs
          </a>
        </div>

        <div className="text-xs text-slate-400">
          &copy; {new Date().getFullYear()} FoodBridge AI Platform. Built with Next.js 15, FastAPI & Prisma.
        </div>
      </div>
    </footer>
  );
}
