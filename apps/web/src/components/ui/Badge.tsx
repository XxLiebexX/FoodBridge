import React from 'react';

export type StatusType =
  | 'AVAILABLE'
  | 'MATCHED'
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PICKUP_ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'VERIFIED'
  | 'PENDING'
  | 'REJECTED'
  | 'HIGH'
  | 'CRITICAL'
  | 'MEDIUM'
  | 'LOW'
  | string;

export function StatusBadge({ status }: { status: StatusType }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MATCHED: 'bg-blue-50 text-blue-700 border-blue-200',
    REQUESTED: 'bg-purple-50 text-purple-700 border-purple-200',
    ACCEPTED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    PICKUP_ASSIGNED: 'bg-amber-50 text-amber-700 border-amber-200',
    PICKED_UP: 'bg-amber-100 text-amber-800 border-amber-300',
    IN_TRANSIT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-300 font-medium',
    EXPIRED: 'bg-rose-50 text-rose-700 border-rose-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    VERIFIED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-100 text-rose-800 border-rose-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300 animate-pulse',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    LOW: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}
    >
      {label}
    </span>
  );
}
