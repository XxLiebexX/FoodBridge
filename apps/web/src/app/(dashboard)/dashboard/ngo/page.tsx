'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/authContext';
import { StatCard } from '../../../../components/ui/StatCard';
import { StatusBadge } from '../../../../components/ui/Badge';
import { MatchScoreBadge } from '../../../../components/ai/MatchScoreBadge';
import { Button } from '../../../../components/ui/Button';
import { LoadingSkeleton, EmptyState } from '../../../../components/ui/LoadingSkeleton';
import {
  Sparkles,
  HeartHandshake,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function NGODashboard() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [recsRes, demandsRes] = await Promise.all([
        api.get('/ngos/recommendations'),
        api.get('/ngos/demands')
      ]);
      setRecommendations(recsRes || []);
      setDemands(demandsRes || []);
    } catch (err) {
      console.error('Failed to load NGO feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (donationId: string) => {
    setActionError(null);
    setActionSuccess(null);
    try {
      await api.post(`/ngos/donations/${donationId}/accept`);
      setActionSuccess('Donation accepted! Pickup and volunteer dispatch has been scheduled.');
      await fetchData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept donation');
    }
  };

  const handleDecline = async (donationId: string) => {
    try {
      await api.post(`/ngos/donations/${donationId}/reject`);
      await fetchData();
    } catch {
      // quiet
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            NGO Shelter Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization?.name || user?.name} • Live Food Rescue Hub
          </p>
        </div>

        <Link
          href="/dashboard/ngo/demand"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>+ Post Daily Demand</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Demand"
          value={demands.length > 0 ? `${demands[0].requestedQuantity} kg` : '0 kg'}
          subtitle={demands.length > 0 ? 'Current active requirement' : 'No active demand posted'}
          icon={<span className="text-xl">🥣</span>}
        />
        <StatCard
          title="AI Recommendations"
          value={recommendations.length}
          subtitle="Available nearby donations"
          icon={<span className="text-xl">✨</span>}
          trend={recommendations.length > 0 ? `Top match: ${recommendations[0]?.score}%` : undefined}
          trendPositive={recommendations.length > 0}
        />
        <StatCard
          title="Beneficiaries"
          value={user?.organization?.ngoProfile?.capacityPeople || 0}
          subtitle="Residents & daily visitors"
          icon={<span className="text-xl">👥</span>}
        />
        <StatCard
          title="Daily Capacity"
          value={`${user?.organization?.ngoProfile?.dailyMealsCapacity || 0} meals`}
          subtitle="Kitchen & distribution capacity"
          icon={<span className="text-xl">🍱</span>}
        />
      </div>

      {/* AI Recommendations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs">
              AI
            </span>
            <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
          </div>
          <span className="text-xs text-slate-400">Ranked by proximity, category & urgency</span>
        </div>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No new recommendations available"
            description="You are currently caught up! New surplus donations in your service radius will appear here instantly."
            action={
              <Link href="/map" className="text-xs text-emerald-600 font-bold hover:underline">
                View city-wide surplus map
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => {
              const d = rec.donation;
              const hoursLeft = Math.max(
                0,
                Math.round((new Date(d.consumeBefore).getTime() - Date.now()) / (1000 * 60 * 60))
              );

              return (
                <div
                  key={rec.matchId}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>{d.vegType === 'VEGETARIAN' ? '🟢' : '🔴'}</span>
                          <span className="text-xs font-semibold text-slate-500 uppercase">{d.category.replace('_', ' ')}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-0.5">{d.foodName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.donorOrg?.name || 'Local Donor'} • {d.pickupAddress}</span>
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {rec.score}% Match
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-semibold uppercase">Quantity</span>
                        <span className="font-bold text-slate-900 text-sm">{d.quantity} {d.quantityUnit}</span>
                        <span className="text-emerald-600 font-semibold block text-[11px]">~{d.estimatedMeals} meals</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-semibold uppercase">Freshness Window</span>
                        <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{hoursLeft} hours remaining</span>
                        </span>
                        <span className="text-slate-500 text-[10px] block mt-0.5">{rec.distanceKm} km away</span>
                      </div>
                    </div>

                    {/* Explainability Badge */}
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{rec.recommendationReason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Button
                      onClick={() => handleAccept(d.id)}
                      className="flex-1 py-2.5 font-bold"
                    >
                      Accept Donation
                    </Button>
                    <Button
                      onClick={() => handleDecline(d.id)}
                      variant="outline"
                      className="py-2.5"
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
