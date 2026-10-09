'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { Button } from '../../../../../components/ui/Button';
import { StatusBadge } from '../../../../../components/ui/Badge';
import { FoodCategory, QuantityUnit, UrgencyLevel } from '@foodbridge/shared';
import { HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';

export default function NGODemandPage() {
  const router = useRouter();
  const [demands, setDemands] = useState<any[]>([]);
  const [category, setCategory] = useState<FoodCategory>(FoodCategory.COOKED_MEALS);
  const [quantity, setQuantity] = useState(100);
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.HIGH);
  const [hoursNeeded, setHoursNeeded] = useState(6);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchDemands = async () => {
    try {
      const data = await api.get('/ngos/demands');
      setDemands(data || []);
    } catch {
      // quiet
    }
  };

  useEffect(() => {
    fetchDemands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    try {
      const requiredBefore = new Date(Date.now() + hoursNeeded * 60 * 60 * 1000);
      await api.post('/ngos/demands', {
        foodCategory: category,
        requestedQuantity: Number(quantity),
        requestedUnit: QuantityUnit.KG,
        urgency,
        requiredBefore: requiredBefore.toISOString()
      });
      setSuccess('Daily hunger relief demand posted successfully!');
      await fetchDemands();
    } catch {
      // quiet
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Food Demand Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Post your daily beneficiary requirements so the AI matching engine prioritizes your kitchen
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Post Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          <span>Post New Demand Requirement</span>
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Food Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FoodCategory)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={FoodCategory.COOKED_MEALS}>Cooked Meals</option>
              <option value={FoodCategory.RAW_PRODUCE}>Raw Produce / Vegetables</option>
              <option value={FoodCategory.BAKERY}>Bakery Items</option>
              <option value={FoodCategory.PACKAGED_GOODS}>Packaged Rations</option>
              <option value={FoodCategory.DAIRY}>Dairy / Milk</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={UrgencyLevel.CRITICAL}>🔴 Critical (Empty Kitchen / Immediate)</option>
              <option value={UrgencyLevel.HIGH}>🟠 High (Required by dinner tonight)</option>
              <option value={UrgencyLevel.MEDIUM}>🟡 Medium (Regular daily requirement)</option>
              <option value={UrgencyLevel.LOW}>⚪ Low (General buffer)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Needed (kg)</label>
            <input
              type="number"
              min={5}
              required
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">~{Math.round(quantity * 2.5)} meals equivalent</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Needed Within (Hours)</label>
            <input
              type="number"
              min={1}
              max={48}
              required
              value={hoursNeeded}
              onChange={(e) => setHoursNeeded(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-2 pt-2 flex justify-end">
            <Button type="submit" loading={loading} className="px-6 py-2.5">
              Submit Active Demand
            </Button>
          </div>
        </form>
      </div>

      {/* Active Demands Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Current Active Demand Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Urgency</th>
                <th className="py-3 px-4">Required Before</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {demands.map((dm) => (
                <tr key={dm.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-6 font-bold text-slate-900">{dm.foodCategory.replace('_', ' ')}</td>
                  <td className="py-3.5 px-4 font-semibold">{dm.requestedQuantity} {dm.requestedUnit}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={dm.urgency} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(dm.requiredBefore).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-6">
                    <StatusBadge status={dm.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
