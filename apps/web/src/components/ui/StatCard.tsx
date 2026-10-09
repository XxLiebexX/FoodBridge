import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({ title, value, subtitle, icon, trend, trendPositive }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {(subtitle || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-slate-500'}`}>
                {trend}
              </span>
            )}
            {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
