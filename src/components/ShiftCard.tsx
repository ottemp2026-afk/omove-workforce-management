import React from 'react';
import { Shift } from '../types';
import { StatusBadge } from './StatusBadge';
import { Clock, Users, Edit3, ArrowRight } from 'lucide-react';

interface ShiftCardProps {
  shift: Shift;
  onEditClick: (shift: Shift) => void;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({ shift, onEditClick }) => {
  return (
    <div
      id={`shift-card-${shift.id.toLowerCase()}`}
      className="flex flex-col justify-between rounded-md border border-slate-200 bg-white p-4"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{shift.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">8-hour regular biometric window</p>
          </div>
          <StatusBadge status={shift.status} size="sm" />
        </div>

        {/* Timings */}
        <div className="mt-3 rounded-md border border-slate-200/80 bg-slate-50/60 p-3">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
              Shift Timings
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span>{shift.startTime}</span>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <span>{shift.endTime}</span>
            {(shift.startTime > shift.endTime || shift.id === 'SHIFT-C' || shift.shiftId === 'SHIFT-C') && (
              <span className="ml-auto rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-800">
                Overnight
              </span>
            )}
          </div>
        </div>

        {/* Assigned Employees */}
        <div className="mt-3 flex items-center justify-between text-xs px-0.5">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users className="h-3 w-3 text-slate-400" />
            <span>Assigned Workforce:</span>
          </div>
          <span className="font-semibold text-slate-900">
            {shift.assignedEmployees} Employees
          </span>
        </div>
      </div>

      {/* Button Action */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          id={`edit-shift-btn-${shift.id.toLowerCase()}`}
          type="button"
          onClick={() => onEditClick(shift)}
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <Edit3 className="h-3 w-3 text-slate-400" />
          <span>Edit Shift Configuration</span>
        </button>
      </div>
    </div>
  );
};
