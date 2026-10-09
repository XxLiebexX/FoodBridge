import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number; // 0 - 100
  breakdown?: {
    distanceScore?: number;
    quantityScore?: number;
    foodCompatibilityScore?: number;
    urgencyScore?: number;
    expiryScore?: number;
    capacityScore?: number;
    distanceKm?: number;
  };
  reason?: string;
  expandable?: boolean;
}

export function MatchScoreBadge({ score, breakdown, reason, expandable = true }: MatchScoreBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (val: number) => {
    if (val >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (val >= 75) return 'text-blue-700 bg-blue-50 border-blue-300';
    if (val >= 60) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase text-slate-500">AI Match Score</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                {score}%
              </span>
            </div>
            {breakdown?.distanceKm !== undefined && (
              <p className="text-xs text-slate-500 mt-0.5">{breakdown.distanceKm} km away from location</p>
            )}
          </div>
        </div>

        {expandable && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-700 text-xs flex items-center gap-0.5 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {reason && (
        <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-start gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{reason}</span>
        </p>
      )}

      {expanded && breakdown && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs">
          <ScoreBar label="Proximity (20%)" value={breakdown.distanceScore || 0} />
          <ScoreBar label="Food Compatibility (20%)" value={breakdown.foodCompatibilityScore || 0} />
          <ScoreBar label="Quantity Match (20%)" value={breakdown.quantityScore || 0} />
          <ScoreBar label="Need Urgency (15%)" value={breakdown.urgencyScore || 0} />
          <ScoreBar label="Expiry Window (15%)" value={breakdown.expiryScore || 0} />
          <ScoreBar label="NGO Capacity (10%)" value={breakdown.capacityScore || 0} />
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-slate-600 text-[11px] mb-1">
        <span>{label}</span>
        <span className="font-semibold text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
