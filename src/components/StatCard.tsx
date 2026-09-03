import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
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
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      id={id}
      className={`rounded-md border bg-white p-3.5 ${
        highlight ? 'border-emerald-300' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 truncate">
            {title}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-semibold text-slate-900 leading-tight">
              {value}
            </span>
            {trend && (
              <span
                className={`text-[11px] font-medium ${
                  trend.isPositive ? 'text-emerald-700' : 'text-slate-500'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-slate-500 truncate">{subtitle}</p>
          )}
        </div>

        <div className="text-slate-400 p-1">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};
