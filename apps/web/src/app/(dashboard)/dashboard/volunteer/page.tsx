'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/authContext';
import { StatCard } from '../../../../components/ui/StatCard';
import { StatusBadge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Modal } from '../../../../components/ui/Modal';
import { LoadingSkeleton, EmptyState } from '../../../../components/ui/LoadingSkeleton';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  PackageCheck
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingDelivery, setCompletingDelivery] = useState<any | null>(null);
  const [receiverName, setReceiverName] = useState('Sunil Verma (Shelter In-Charge)');
  const [deliveredQuantity, setDeliveredQuantity] = useState<number>(25);
  const [deliveryNotes, setDeliveryNotes] = useState('Delivered hot in sealed trays. Verified temperature.');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchPickups = async () => {
    try {
      const data = await api.get('/pickups/available');
      setPickups(data || []);
    } catch (err) {
      console.error('Failed to load pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleAcceptAssignment = async (pickupId: string) => {
    try {
      await api.post(`/pickups/${pickupId}/accept`);
      setSuccessMsg('Pickup assignment accepted! Head to the donor location.');
      await fetchPickups();
    } catch {
      // quiet
    }
  };

  const handleUpdateStatus = async (pickupId: string, status: string) => {
    try {
      await api.patch(`/pickups/${pickupId}/status`, { status });
      setSuccessMsg(`Status updated to ${status.replace(/_/g, ' ')}`);
      await fetchPickups();
    } catch {
      // quiet
    }
  };

  const handleConfirmDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingDelivery) return;

    setSubmitting(true);
    try {
      await api.post(`/pickups/deliveries/${completingDelivery.delivery?.id}/complete`, {
        receiverName,
        deliveredQuantity: Number(deliveredQuantity),
        deliveryNotes
      });

      setSuccessMsg(`Successfully delivered ${deliveredQuantity} kg to ${receiverName}! Database impact updated.`);
      setCompletingDelivery(null);
      await fetchPickups();
    } catch {
      // quiet
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Volunteer Delivery Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {user?.name} • Food Rescue Transit & Proof Verification
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Assignments"
          value={pickups.filter(p => p.status !== 'DELIVERED').length}
          subtitle="Rescue orders pending completion"
          icon={<Truck className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Vehicle"
          value={user?.volunteerProfile?.vehicleType?.replace('_', ' ') || 'TWO WHEELER'}
          subtitle={`Capacity: ${user?.volunteerProfile?.maxCapacityKg || 25} kg`}
          icon={<span className="text-xl">🛵</span>}
        />
        <StatCard
          title="Deliveries Completed"
          value={user?.volunteerProfile?.totalDeliveries || 0}
          subtitle="Diverted good food from landfills"
          icon={<PackageCheck className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Assignments Stepper Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Rescue Assignments & Stepper</h2>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : pickups.length === 0 ? (
          <EmptyState
            title="No pending pickup assignments"
            description="When NGOs accept surplus food donations, dispatch alerts will appear here."
          />
        ) : (
          <div className="space-y-4">
            {pickups.map((p) => {
              const d = p.donation || {};
              const isAssignedToMe = p.volunteerId === user?.id;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{d.foodName || 'Surplus Food'}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Quantity: <strong>{d.quantity || 10} {d.quantityUnit || 'KG'}</strong> (~{d.estimatedMeals || 25} meal portions)
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-400">
                      Scheduled for {new Date(p.scheduledTime || p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Route & Locations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                        1. Pickup Location (Donor)
                      </span>
                      <div className="font-bold text-slate-900">{d.donorOrg?.name || d.donor?.name}</div>
                      <div className="text-slate-600 mt-0.5">📍 {d.pickupAddress}</div>
                      <div className="text-slate-500 mt-1">📞 Contact: {d.donor?.phone || '+91 9811001122'}</div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                        2. Destination (NGO Shelter)
                      </span>
                      <div className="font-bold text-slate-900">{p.delivery?.destinationAddress}</div>
                      <div className="text-slate-600 mt-0.5">Target: Verified Beneficiary Kitchen</div>
                      <div className="text-slate-500 mt-1">Status: {p.delivery?.status || 'Assigned'}</div>
                    </div>
                  </div>

                  {/* Workflow Stepper Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                    {!p.volunteerId ? (
                      <Button
                        onClick={() => handleAcceptAssignment(p.id)}
                        className="py-2 px-4"
                      >
                        Accept Rescue Assignment
                      </Button>
                    ) : p.status === 'ASSIGNED' ? (
                      <Button
                        onClick={() => handleUpdateStatus(p.id, 'ON_WAY_TO_PICKUP')}
                        className="py-2 px-4"
                      >
                        Start Journey to Donor 🛵
                      </Button>
                    ) : p.status === 'ON_WAY_TO_PICKUP' ? (
                      <Button
                        onClick={() => handleUpdateStatus(p.id, 'PICKED_UP')}
                        className="py-2 px-4 bg-amber-600 hover:bg-amber-700"
                      >
                        Confirm Food Picked Up 🍱
                      </Button>
                    ) : p.status === 'PICKED_UP' ? (
                      <Button
                        onClick={() => {
                          setCompletingDelivery(p);
                          setDeliveredQuantity(d.quantity);
                        }}
                        className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Complete Delivery & Submit Proof ✨
                      </Button>
                    ) : (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        ✅ Delivery Successfully Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof of Delivery Modal */}
      {completingDelivery && (
        <Modal
          isOpen={!!completingDelivery}
          onClose={() => setCompletingDelivery(null)}
          title="Confirm Delivery & Submit Proof"
        >
          <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Receiver Name / Representative</label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Delivered Quantity (kg)</label>
              <input
                type="number"
                step={0.5}
                required
                value={deliveredQuantity}
                onChange={(e) => setDeliveredQuantity(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Delivery / Inspection Notes</label>
              <textarea
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-[11px] leading-relaxed">
              🌱 Submitting will mark this donation as <strong>DELIVERED</strong>, updating global metrics by +{deliveredQuantity} kg and ~{Math.round(deliveredQuantity * 2.5)} meals.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCompletingDelivery(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Confirm Delivery
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
