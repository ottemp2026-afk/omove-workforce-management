import React from 'react';
import { Shift } from '../types';
import { StatusBadge } from './StatusBadge';
import { Clock, Users, Edit3, ArrowRight, Sun, Sunset, Moon } from 'lucide-react';

interface ShiftCardProps {
  shift: Shift;
  onEditClick: (shift: Shift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onEditClick }) => {
  const isNight = shift.startTime > shift.endTime || shift.id === 'SHIFT-C' || shift.shiftId === 'SHIFT-C';
  const isAfternoon = shift.id === 'SHIFT-B' || shift.shiftId === 'SHIFT-B';

  const theme = isNight
    ? {
        cardBg: 'bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/40 border-indigo-200/90 hover:border-indigo-400',
        stripe: 'bg-gradient-to-r from-indigo-500 to-purple-600',
        iconBg: 'bg-indigo-600 text-white',
        Icon: Moon,
        tag: 'Overnight Shift',
        tagBg: 'bg-purple-100 text-purple-800 border-purple-200',
      }
    : isAfternoon
    ? {
        cardBg: 'bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/40 border-sky-200/90 hover:border-sky-400',
        stripe: 'bg-gradient-to-r from-sky-500 to-cyan-500',
        iconBg: 'bg-sky-600 text-white',
        Icon: Sunset,
        tag: 'Evening Shift',
        tagBg: 'bg-sky-100 text-sky-800 border-sky-200',
      }
    : {
        cardBg: 'bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 border-amber-200/90 hover:border-amber-400',
        stripe: 'bg-gradient-to-r from-amber-500 to-orange-500',
        iconBg: 'bg-amber-500 text-white',
        Icon: Sun,
        tag: 'Morning Shift',
        tagBg: 'bg-amber-100 text-amber-800 border-amber-200',
      };

  const ShiftIcon = theme.Icon;

  return (
    <div
      id={`shift-card-${shift.id.toLowerCase()}`}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 sm:p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${theme.cardBg}`}
    >
      {/* Top colored stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${theme.stripe}`} />

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ${theme.iconBg}`}>
              <ShiftIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 tracking-tight">{shift.name}</h3>
              <p className="text-[11px] text-slate-500 font-medium">8-hour regular shift rotation</p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-bold border ${theme.tagBg}`}>
            {theme.tag}
          </span>
        </div>

        {/* Timings */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600">
              Shift Timings Window
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-base font-bold font-mono text-slate-900">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{shift.startTime}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{shift.endTime}</span>
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="mt-3.5 flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Users className="h-4 w-4 text-slate-400" />
            <span>Assigned Workforce:</span>
          </div>
          <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
            {shift.assignedEmployees || 0} Staff
          </span>
        </div>
      </div>

      {/* Button Action */}
      <div className="mt-5 pt-3.5 border-t border-slate-200/70">
        <button
          id={`edit-shift-btn-${shift.id.toLowerCase()}`}
          type="button"
          onClick={() => onEditClick(shift)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
        >
          <Edit3 className="h-3.5 w-3.5 text-slate-500" />
          <span>Edit Shift Configuration</span>
        </button>
      </div>
    </div>
  );
};
