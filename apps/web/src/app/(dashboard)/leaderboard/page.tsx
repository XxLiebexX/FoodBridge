'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Award, Trophy, Medal, Star, Flame, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<any>({ donors: [], volunteers: [] });
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [boardRes, badgesRes] = await Promise.all([
          api.get('/impact/leaderboards'),
          api.get('/impact/badges')
        ]);
        setLeaderboards(boardRes || { donors: [], volunteers: [] });
        setBadges(badgesRes || []);
      } catch (err) {
        console.error('Failed to load leaderboards:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold mb-2">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Community Impact Champions</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Food Rescuer Leaderboards & Badges
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Honoring the restaurants, institutions, and delivery heroes diverting good food from waste
        </p>
      </div>

      {/* Gamification Badges Grid */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Achievement Badges</h2>
            <p className="text-xs text-slate-500 mt-0.5">Unlocked as you rescue meals and complete missions</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border text-center transition-all ${
                b.unlocked
                  ? 'bg-linear-to-b from-amber-50/70 to-white border-amber-200/80 shadow-xs'
                  : 'bg-slate-50 border-slate-200/60 opacity-60'
              }`}
            >
              <div className="text-3xl mb-2">{b.icon}</div>
              <h3 className="font-bold text-xs text-slate-900">{b.name}</h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">{b.description}</p>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${b.unlocked ? 'bg-amber-500' : 'bg-slate-400'}`}
                  style={{ width: `${b.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
                {b.unlocked ? '✅ Unlocked' : `${b.progressPercent}% Completed`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard Tables (Donors & Volunteers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Food Rescuers (Donors)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by total quantity salvaged</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Total Rescued</th>
                  <th className="py-3 px-4 text-right">Meals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaderboards.donors.map((d: any) => (
                  <tr key={d.rank} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-black text-slate-900">
                      {d.rank === 1 ? '🥇' : d.rank === 2 ? '🥈' : d.rank === 3 ? '🥉' : `#${d.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {d.name}
                      <span className="text-[10px] text-slate-400 block font-normal">{d.city}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{d.totalFoodKg} kg</td>
                    <td className="py-3 px-4 text-right font-bold">{d.totalMeals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Volunteers */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Delivery Champions (Volunteers)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by rescue deliveries completed</p>
            </div>
            <Medal className="w-5 h-5 text-blue-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Volunteer</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4 text-right">Deliveries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaderboards.volunteers.map((v: any) => (
                  <tr key={v.rank} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-black text-slate-900">
                      {v.rank === 1 ? '🥇' : v.rank === 2 ? '🥈' : v.rank === 3 ? '🥉' : `#${v.rank}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{v.name}</td>
                    <td className="py-3 px-4 text-slate-500">{v.vehicleType?.replace(/_/g, ' ') || 'Two Wheeler'}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">{v.totalDeliveries}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
