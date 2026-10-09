'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/authContext';
import { StatCard } from '../../../../components/ui/StatCard';
import { StatusBadge } from '../../../../components/ui/Badge';
import { MatchScoreBadge } from '../../../../components/ai/MatchScoreBadge';
import { Modal } from '../../../../components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '../../../../components/ui/LoadingSkeleton';
import {
  PlusCircle,
  Package,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar
} from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatches, setSelectedMatches] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          api.get('/donations/stats'),
          api.get('/donations?limit=20')
        ]);
        setStats(statsRes);
        setDonations(donationsRes);
      } catch (err) {
        console.error('Failed to load donor data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Donor Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization?.name || user?.name} • Live Surplus Operations
          </p>
        </div>

        <Link
          href="/dashboard/donor/create"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Donate Food</span>
        </Link>
      </div>

      {/* Top Stat Cards */}
      {loading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Food Rescued"
            value={`${stats?.totalFoodDonatedKg || 0} kg`}
            subtitle="Verified delivered food"
            icon={<span className="text-xl">🌱</span>}
            trend="+18% this month"
            trendPositive
          />
          <StatCard
            title="Meals Rescued"
            value={stats?.totalMealsRescued?.toLocaleString() || 0}
            subtitle="Wholesome meal portions"
            icon={<span className="text-xl">🍱</span>}
          />
          <StatCard
            title="Waste Prevented"
            value={`${stats?.foodWastePreventedKg || 0} kg`}
            subtitle={`${stats?.co2SavedKg || 0} kg CO₂ saved`}
            icon={<span className="text-xl">♻️</span>}
          />
          <StatCard
            title="Active Donations"
            value={stats?.pendingDonations || 0}
            subtitle={`${stats?.successfulDonations || 0} completed`}
            icon={<span className="text-xl">📦</span>}
          />
        </div>
      )}

      {/* Recent Food Donations Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Food Donations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track status, AI matches, and volunteer pickups</p>
          </div>
        </div>

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} />
          </div>
        ) : donations.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No food donations logged yet"
              description="Record your kitchen surplus to let FoodBridge AI match suitable shelters instantly."
              action={
                <Link
                  href="/dashboard/donor/create"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Create First Donation
                </Link>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Food Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Quantity / Meals</th>
                  <th className="py-3.5 px-4">Expires In</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">AI Matches</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {donations.map((d) => {
                  if (!d) return null;
                  const consumeDate = d.consumeBefore ? new Date(d.consumeBefore).getTime() : Date.now();
                  const hoursLeft = Math.max(
                    0,
                    Math.round((consumeDate - Date.now()) / (1000 * 60 * 60))
                  );

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 max-w-[220px] truncate">
                        <div className="flex items-center gap-2">
                          <span>{d.vegType === 'VEGETARIAN' ? '🟢' : '🔴'}</span>
                          <span className="truncate">{d.foodName}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                          📍 {d.pickupAddress}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600">
                        {d.category.replace('_', ' ')}
                      </td>

                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-900">{d.quantity} {d.quantityUnit}</span>
                        <span className="text-[10px] text-emerald-600 block font-semibold">
                          ~{d.estimatedMeals} meals
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hoursLeft > 0 ? `${hoursLeft} hrs left` : 'Expired'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <StatusBadge status={d.status} />
                      </td>

                      <td className="py-4 px-4">
                        {d.matches && d.matches.length > 0 ? (
                          <button
                            onClick={() => setSelectedMatches({ donation: d, matches: d.matches })}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{d.matches[0].score}% Top Match</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Finding...</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedMatches({ donation: d, matches: d.matches || [] })}
                          className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Matches Detail Modal */}
      {selectedMatches && (
        <Modal
          isOpen={!!selectedMatches}
          onClose={() => setSelectedMatches(null)}
          title={`AI NGO Matches for "${selectedMatches.donation.foodName}"`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex justify-between">
              <div>
                <span className="text-slate-500">Quantity:</span>{' '}
                <strong>{selectedMatches.donation.quantity} {selectedMatches.donation.quantityUnit}</strong> (~{selectedMatches.donation.estimatedMeals} meals)
              </div>
              <div>
                <span className="text-slate-500">Status:</span>{' '}
                <StatusBadge status={selectedMatches.donation.status} />
              </div>
            </div>

            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Shelters (Ranked by 6-Factor AI Scoring)
            </div>

            {selectedMatches.matches.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active matches found within radius.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {selectedMatches.matches.map((m: any) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{m.ngoOrg?.name || 'Partner Shelter'}</div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      💡 {m.recommendationReason}
                    </p>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1">
                      <div>Distance: <strong>{m.distanceKm} km</strong></div>
                      <div>Quantity Fit: <strong>{m.quantityFit}%</strong></div>
                      <div>Expiry Priority: <strong>{m.expiryScore}%</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
