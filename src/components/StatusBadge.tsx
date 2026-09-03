import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase().trim();

  // Restrained professional palette:
  // Green only for positive attendance/status
  // Red only for errors/clock-out/negative status
  // Subtle gray for neutral
  let styles = 'bg-slate-50 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (normalized) {
    case 'WORKING':
    case 'ACTIVE':
    case 'ONLINE':
    case 'READY':
    case 'COMPLETED':
    case 'WORK IN':
    case 'SYNCHRONIZED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-600';
      break;

    case 'WORK OUT':
    case 'LATE':
    case 'ERROR':
    case 'INACTIVE':
    case 'OFFLINE':
      styles = 'bg-rose-50 text-rose-800 border-rose-200';
      dotColor = 'bg-rose-600';
      break;

    case 'WORK COMPLETED':
      styles = 'bg-slate-50 text-slate-800 border-slate-200';
      dotColor = 'bg-slate-500';
      break;

    case 'ON LEAVE':
    case 'STANDBY':
    case 'HALF DAY':
      styles = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;

    case 'NOT STARTED':
    default:
      styles = 'bg-slate-50 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
  }

  const sizeStyles = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1.5' 
    : 'text-xs px-2.5 py-0.5 gap-1.5 font-medium';

  return (
    <span
      id={`status-badge-${normalized.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded-md border tracking-normal whitespace-nowrap ${sizeStyles} ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{status}</span>
    </span>
  );
};

