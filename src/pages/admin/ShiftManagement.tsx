import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { ShiftCard } from '../../components/ShiftCard';
import { EditShiftModal } from '../../components/EditShiftModal';
import { StatCard } from '../../components/StatCard';
import { Shift } from '../../types';
import { Clock, Info, ShieldCheck, Layers, CheckCircle2, Timer } from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const { shifts } = useAttendance();
  const [selectedShiftForEdit, setSelectedShiftForEdit] = useState<Shift | null>(null);

  const handleEditClick = (shift: Shift) => {
    setSelectedShiftForEdit(shift);
  };

  return (
    <div className="space-y-7 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Shift Management
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-xs font-mono font-bold">
              3 Cycles Active
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Configure workforce shift schedules, timing thresholds, and DS3231 biometric grace intervals
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold">Hardware RTC Timings Synced</span>
        </div>
      </div>

      {/* Shift Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          id="stat-shifts-total"
          title="ACTIVE SHIFTS"
          value={shifts.length}
          subtitle="Rotational work schedules"
          icon={Layers}
          accentColor="blue"
          badge="ROTATIONS"
        />
        <StatCard
          id="stat-shifts-duration"
          title="STANDARD DURATION"
          value="08h 00m"
          subtitle="480 minutes regular block"
          icon={Clock}
          accentColor="emerald"
          badge="NORMAL"
        />
        <StatCard
          id="stat-shifts-grace"
          title="GRACE BUFFER"
          value="15 Mins"
          subtitle="Buffer before 'Late' penalty"
          icon={Timer}
          accentColor="amber"
          badge="GRACE"
        />
      </div>

      {/* Shift Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shifts.map(shift => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            onEditClick={handleEditClick}
          />
        ))}
      </div>

      {/* Shift Rules & Policies Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Shift Policy & Hardware Rules</h3>
              <p className="text-xs text-slate-500">Autonomous evaluation by ESP32 edge terminal</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Firmware v2.4
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 p-4">
            <span className="font-extrabold text-amber-900 block text-sm">Biometric Grace Buffer</span>
            <p className="text-slate-600 mt-1 leading-relaxed">
              15 minutes buffer window after shift start time before an employee is marked as "Late" on the ledger.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/30 p-4">
            <span className="font-extrabold text-blue-900 block text-sm">Early Clock-in Window</span>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Punches allowed up to 30 minutes prior to scheduled shift start. Time counted strictly from scheduled shift start.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 p-4">
            <span className="font-extrabold text-emerald-900 block text-sm">Overtime Qualification</span>
            <p className="text-slate-600 mt-1 leading-relaxed">
              Overtime begins strictly after 8 completed hours (480 minutes). Only complete 1-hour continuous blocks qualify for ₹80/hr payout.
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
