'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { StatCard } from '../../../components/ui/StatCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export default function AnalyticsPage() {
  const [impact, setImpact] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/impact/overview'),
      api.get('/impact/trends')
    ])
      .then(([overview, trends]) => {
        setImpact(overview);
        setTrendData(trends.trendData || []);
        setCategoryData(trends.categoryData || []);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalRescuedKg = impact?.foodRescuedKg || 0;
  const totalMeals = impact?.mealsProvided || 0;
  const totalWaste = impact?.wastePreventedKg || 0;
  const totalCo2 = impact?.co2SavedKg || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Impact & Operations Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform food recovery and carbon offset metrics from verified database deliveries
          </p>
        </div>

        {/* Time range switcher */}
        <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-2xl shadow-xs self-start sm:self-auto">
          {(['7d', '30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-all ${
                timeRange === r ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Food Rescued"
          value={`${totalRescuedKg.toLocaleString()} kg`}
          subtitle="Direct shelter deliveries"
          icon={<span className="text-xl">🌱</span>}
        />
        <StatCard
          title="Meals Rescued"
          value={totalMeals.toLocaleString()}
          subtitle="Hunger relief portions"
          icon={<span className="text-xl">🍱</span>}
        />
        <StatCard
          title="Waste Diverted"
          value={`${totalWaste.toLocaleString()} kg`}
          subtitle="Saved from methane release"
          icon={<span className="text-xl">♻️</span>}
        />
        <StatCard
          title="CO₂ Avoided"
          value={`${totalCo2.toLocaleString()} kg`}
          subtitle="2.5 kg CO₂e / kg food"
          icon={<span className="text-xl">☁️</span>}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rescue Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Food Rescue Volume (kg)</h2>
              <p className="text-xs text-slate-500">Daily rescued surplus across donor entities</p>
            </div>
            <BarChart3 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full pt-2">
            {trendData.some(d => d.rescuedKg > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} unit=" kg" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="rescuedKg" name="Food Rescued (kg)" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                <span>📊 No completed deliveries recorded yet</span>
                <span className="text-[11px] text-slate-400 mt-1">Deliveries will automatically populate this graph</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Food Category Share</h2>
              <p className="text-xs text-slate-500">Distribution by meal type</p>
            </div>
            <PieIcon className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="h-64 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                <span>🥧 No categories logged yet</span>
                <span className="text-[11px] text-slate-400 mt-1">Category breakdown will reflect real rescued batches</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
