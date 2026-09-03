import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { ShiftCard } from '../../components/ShiftCard';
import { EditShiftModal } from '../../components/EditShiftModal';
import { Shift } from '../../types';
import { Clock, Info, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const { shifts } = useAttendance();
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState<Shift | null>(null);

  const handleEditClick = (shift: Shift) => {
    setSelectedShiftForEdit(shift);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Shift Management
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Configure workforce shift schedules, timing thresholds, and biometric grace intervals
        </p>
      </div>

      {/* Hardware Sync Info Alert */}
      <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3.5">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-800">
            Hardware Schedule Synchronization:
          </p>
          <p className="mt-0.5 text-slate-500">
            Shift windows are transferred to the ESP32 unit. The DS3231 RTC module evaluates employee clock-in punches against these shift windows to classify entries as <span className="font-medium text-slate-800">On Time</span>, <span className="font-medium text-rose-700">Late</span>, or <span className="font-medium text-emerald-700">Overtime</span>.
          </p>
        </div>
      </div>

      {/* Shift Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shifts.map(shift => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            onEditClick={handleEditClick}
          />
        ))}
      </div>

      {/* Shift Rules & Policies Card */}
      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h3 className="text-base font-semibold text-slate-900 mb-3">
          Shift Policy & Grace Interval Rules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-3">
            <span className="font-medium text-slate-900 block">Biometric Grace Period</span>
            <p className="text-slate-500 mt-1">
              15 minutes buffer window after shift start before mark as "Late".
            </p>
          </div>
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-3">
            <span className="font-medium text-slate-900 block">Early Clock-in Allowed</span>
            <p className="text-slate-500 mt-1">
              Up to 30 minutes prior to scheduled shift start time.
            </p>
          </div>
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-3">
            <span className="font-medium text-slate-900 block">Standard Shift Duration</span>
            <p className="text-slate-500 mt-1">
              8 continuous work hours per regular scheduled workday.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={Boolean(selectedShiftForEdit)}
        onClose={() => setSelectedShiftForEdit(null)}
        shift={selectedShiftForEdit}
      />
    </div>
  );
};
