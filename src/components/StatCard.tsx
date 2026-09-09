import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: boolean;
  accentColor?: 'emerald' | 'cyan' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';
  badge?: string;
}

const colorMap = {
  blue: {
    cardBg: 'bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 border-blue-200/90 hover:border-blue-400/90 hover:shadow-lg hover:shadow-blue-500/10',
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/20',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200/80',
    stripe: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    glowDot: 'bg-blue-500',
  },
  cyan: {
    cardBg: 'bg-gradient-to-br from-cyan-50/90 via-white to-teal-50/40 border-cyan-200/90 hover:border-cyan-400/90 hover:shadow-lg hover:shadow-cyan-500/10',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md shadow-cyan-500/25 ring-2 ring-cyan-400/20',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200/80',
    stripe: 'bg-gradient-to-r from-cyan-500 to-teal-500',
    glowDot: 'bg-cyan-500',
  },
  emerald: {
    cardBg: 'bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/50 border-emerald-300 ring-2 ring-emerald-500/20 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/15',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-400/30',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    stripe: 'bg-gradient-to-r from-emerald-500 to-teal-400',
    glowDot: 'bg-emerald-500 animate-pulse',
  },
  purple: {
    cardBg: 'bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/40 border-purple-200/90 hover:border-purple-400/90 hover:shadow-lg hover:shadow-purple-500/10',
    iconBg: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25 ring-2 ring-purple-400/20',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200/80',
    stripe: 'bg-gradient-to-r from-purple-500 to-fuchsia-500',
    glowDot: 'bg-purple-500',
  },
  amber: {
    cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 border-amber-200/90 hover:border-amber-400/90 hover:shadow-lg hover:shadow-amber-500/10',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/20',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200/80',
    stripe: 'bg-gradient-to-r from-amber-500 to-orange-500',
    glowDot: 'bg-amber-500',
  },
  rose: {
    cardBg: 'bg-gradient-to-br from-rose-50/90 via-white to-pink-50/40 border-rose-200/90 hover:border-rose-400/90 hover:shadow-lg hover:shadow-rose-500/10',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-400/20',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200/80',
    stripe: 'bg-gradient-to-r from-rose-500 to-pink-500',
    glowDot: 'bg-rose-500',
  },
  slate: {
    cardBg: 'bg-gradient-to-br from-slate-50 via-white to-slate-100/50 border-slate-200/90 hover:border-slate-300 hover:shadow-md',
    iconBg: 'bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-md shadow-slate-500/20 ring-2 ring-slate-400/20',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    stripe: 'bg-slate-400',
    glowDot: 'bg-slate-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
  accentColor = 'slate',
  badge,
}) => {
  const scheme = colorMap[accentColor] || colorMap.slate;

  return (
    <div
      id={id}
      className={`group relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 shadow-xs ${scheme.cardBg}`}
    >
      {/* Top glowing colored accent bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${scheme.stripe} ${
          highlight ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Header row: category + badge */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${scheme.glowDot}`} />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 leading-snug">
              {title}
            </p>
            {badge && (
              <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9.5px] font-mono font-bold uppercase border ${scheme.badgeBg}`}>
                {badge}
              </span>
            )}
          </div>

          {/* Value row */}
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-950 tracking-tight leading-none">
              {value}
            </span>
            {trend && (
              <span
                className={`inline-flex items-center text-[10.5px] font-bold px-1.5 py-0.5 rounded-md ${
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="mt-2 text-xs text-slate-500 font-medium leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* High-contrast Icon Container */}
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${scheme.iconBg}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};
