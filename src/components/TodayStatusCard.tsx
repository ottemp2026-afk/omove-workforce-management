import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from './StatusBadge';
import { 
  Fingerprint, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar, 
  Activity, 
  LogIn, 
  Sparkles,
  ShieldCheck,
  Zap,
  Timer,
  Radio
} from 'lucide-react';
import { getElapsedWorkTime, formatTo12Hour } from '../utils/overtime';

interface TodayStatusCardProps {
  onOpenScanModal?: () => void;
}

export const TodayStatusCard: React.FC<TodayStatusCardProps> = () => {
  const { 
    todayWorkStatus, 
    todayInTime, 
    todayWorkHours, 
    todayOvertime, 
    todayInTimestamp, 
    selectedEmployee,
    shifts
  } = useAttendance();

  // Live timer tick state - updates every second client-side without writing to Firestore
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());

  useEffect(() => {
    // Only run timer if employee is currently working and has a valid inTimestamp
    if (todayWorkStatus !== 'WORKING' || !todayInTimestamp) {
      return;
    }

    // Immediately synchronize to current timestamp
    setCurrentTime(Date.now());

    // Update every second
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [todayWorkStatus, todayInTimestamp]);

  const assignedShift = shifts.find(
    s => s.id === selectedEmployee?.shiftId || s.shiftId === selectedEmployee?.shiftId
  ) || shifts[0] || {
    name: 'Shift A',
    startTime: '06:00',
    endTime: '14:00',
  };

  // Derive live elapsed work duration and overtime from IN timestamp (starts at 00:00:00 upon punch-in)
  const liveTime = useMemo(() => {
    if (todayWorkStatus !== 'WORKING' || !todayInTimestamp) {
      return null;
    }
    return getElapsedWorkTime(
      todayInTimestamp,
      currentTime,
      selectedEmployee?.overtimeRate || 80
    );
  }, [todayWorkStatus, todayInTimestamp, currentTime, selectedEmployee?.overtimeRate]);

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (!selectedEmployee) {
    return (
      <div id="today-work-status-card" className="rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xs text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Employee Selected</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please select an employee profile from the directory to monitor real-time biometric shift progress.
        </p>
      </div>
    );
  }

  return (
    <div
      id="today-work-status-card"
      className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-sm"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Today's Shift & Attendance</span>
            </h2>

            {todayWorkStatus === 'WORKING' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Shift in Progress
              </span>
            )}
            {todayWorkStatus === 'WORK COMPLETED' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                ✓ Shift Completed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Biometric scan verification & shift timing</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{assignedShift.name}</span>
            <span className="font-mono text-slate-600">({formatTo12Hour(assignedShift.startTime)} – {formatTo12Hour(assignedShift.endTime)})</span>
          </p>
        </div>

        {/* Hardware Mode Badge / Quick Link to Live Ledger */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/live-ledger');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-emerald-50/90 hover:bg-emerald-100/90 px-3 py-1.5 text-xs text-emerald-900 shadow-2xs transition-all cursor-pointer group"
            title="Open Dedicated Real-time Biometric Hardware Ledger"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[11px] tracking-wide">Live Hardware Ledger</span>
            <Radio className="h-3 w-3 text-emerald-600 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* DEDICATED LIVE WORK-TIME BANNER (when status is WORKING) */}
      {todayWorkStatus === 'WORKING' && liveTime && (
        <div 
          id="live-work-timer-banner"
          className="mb-5 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 shadow-md relative overflow-hidden"
        >
          {/* Ambient live pulse background glow */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/15 blur-2xl animate-pulse" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* IN punch context */}
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700 text-emerald-400 shadow-sm">
                <Timer className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Shift Stopwatch
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800">
                    Punched IN at {todayInTime}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Live stopwatch started at 00:00:00 on punch-in ({todayInTime}) • Synchronized with hardware
                </p>
              </div>
            </div>

            {/* Live Counters */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Counter 1: WORKED */}
              <div id="live-worked-counter" className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Total Time Worked
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white tabular-nums">
                    {liveTime.formattedWorked}
                  </span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Standard Shift: 08:00:00 (480 mins)
                </span>
              </div>

              {/* Counter 2: OVERTIME (After 8 completed hours) */}
              {liveTime.isOvertime ? (
                <div id="live-overtime-counter" className="flex flex-col pl-5 border-l border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                      OVERTIME
                    </span>
                    <span className="rounded-md bg-amber-950/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-800">
                      {liveTime.otCompletedHours}h Paid
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-400 tabular-nums mt-0.5">
                    {liveTime.formattedOvertime}
                  </span>
                  <span className="text-[10px] text-amber-300/90 mt-0.5">
                    ₹{liveTime.otPay.toFixed(0)} • Complete 1-hour block rule
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex flex-col pl-5 border-l border-slate-800">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Overtime Threshold
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-500 tabular-nums mt-0.5">
                    00:00:00
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Unlocks after 8 full hours (480m)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5 Distinct Elevated Metric Cards with Vibrant Gradients */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* Card 1: TODAY */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 via-white to-indigo-50/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-blue-400">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-800">Shift Date</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500 text-white shadow-xs">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 tracking-tight">
            {todayFormatted}
          </p>
          <p className="text-[11px] text-blue-700 mt-1 font-medium truncate">
            {assignedShift.name} ({formatTo12Hour(assignedShift.startTime)}–{formatTo12Hour(assignedShift.endTime)})
          </p>
        </div>

        {/* Card 2: WORK STATUS */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-400">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-emerald-800">Work Status</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-xs">
              <Activity className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-0.5">
            <StatusBadge status={todayWorkStatus} size="sm" />
          </div>
          <p className="text-[11px] text-emerald-700 mt-1.5 font-medium">
            {todayWorkStatus === 'WORKING' ? '● Actively tracking time' : todayWorkStatus === 'WORK COMPLETED' ? '✓ Shift finalized' : '○ Awaiting check-in'}
          </p>
        </div>

        {/* Card 3: IN TIME */}
        <div className="group relative overflow-hidden rounded-2xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50/90 via-white to-sky-50/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-400">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-teal-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-cyan-800">Check-In Punch</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-xs">
              <LogIn className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 font-mono tracking-tight">
            {todayInTime ? todayInTime.replace(/\s+/g, ' ') : '--:--'}
          </p>
          <p className="text-[11px] text-cyan-700 mt-1 font-medium">
            {todayInTime !== '--:--' ? 'Biometric Verified (R307S)' : 'Sensor punch pending'}
          </p>
        </div>

        {/* Card 4: WORKED */}
        <div className={`group relative overflow-hidden rounded-2xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
          todayWorkStatus === 'WORKING'
            ? 'border-emerald-300 bg-gradient-to-br from-emerald-50/95 via-white to-teal-50/50 ring-2 ring-emerald-500/20'
            : 'border-purple-200/90 bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/40'
        }`}>
          <div className={`absolute top-0 left-0 right-0 h-1 ${
            todayWorkStatus === 'WORKING' ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-purple-500 to-indigo-500'
          }`} />
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10.5px] font-extrabold uppercase tracking-wider ${
              todayWorkStatus === 'WORKING' ? 'text-emerald-800' : 'text-purple-800'
            }`}>Hours Clocked</span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg text-white shadow-xs ${
              todayWorkStatus === 'WORKING' ? 'bg-emerald-600' : 'bg-purple-600'
            }`}>
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          {todayWorkStatus === 'WORKING' && liveTime ? (
            <div>
              <p className="font-mono text-base font-extrabold text-emerald-800 tracking-tight tabular-nums flex items-center gap-1.5">
                <span>{liveTime.formattedWorked}</span>
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </p>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Live counter from IN punch ({todayInTime})
              </p>
            </div>
          ) : todayWorkStatus === 'WORK COMPLETED' ? (
            <div>
              <p className="font-mono text-base font-bold text-slate-900 tracking-tight">
                {todayWorkHours}
              </p>
              <p className="text-[11px] text-purple-700 mt-1 font-medium">
                Shift logged in Firestore
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-base font-bold text-slate-400 tracking-tight">
                00h 00m
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                Standard shift: 08h 00m
              </p>
            </div>
          )}
        </div>

        {/* Card 5: OVERTIME */}
        <div className="col-span-2 sm:col-span-1 group relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-amber-400">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-800">Overtime Pay</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
          </div>
          {todayWorkStatus === 'WORKING' && liveTime ? (
            liveTime.isOvertime ? (
              <div>
                <p className="font-mono text-base font-extrabold text-amber-700 tracking-tight tabular-nums">
                  {liveTime.formattedOvertime}
                </p>
                <p className="text-[11px] text-amber-800 font-bold mt-1">
                  {liveTime.otCompletedHours}h block • ₹{liveTime.otPay.toFixed(0)}
                </p>
              </div>
            ) : (
              <div>
                <p className="font-mono text-base font-bold text-slate-400 tabular-nums">
                  00:00:00
                </p>
                <p className="text-[11px] text-amber-700 font-medium mt-1">
                  Starts after 8h • ₹0
                </p>
              </div>
            )
          ) : todayWorkStatus === 'WORK COMPLETED' ? (
            <div>
              <p className="font-mono text-base font-bold text-slate-900 tracking-tight">
                {todayOvertime}
              </p>
              <p className="text-[11px] text-amber-800 mt-1 font-semibold">
                ₹{selectedEmployee.overtimeRate || 80}/hr (1-hr blocks)
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-base font-bold text-slate-400 tracking-tight">
                00h 00m
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Rate: ₹{selectedEmployee.overtimeRate || 80}/hr
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Complete 1-Hour Block Policy Footnote */}
      {todayWorkStatus === 'WORKING' && liveTime?.isOvertime && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Overtime Policy in Effect: </span>
            Overtime compensation is paid exclusively for complete 1-hour blocks (480m regular + 60m blocks). Current total minutes: {Math.floor(liveTime.elapsedSeconds / 60)}m → {liveTime.otCompletedHours} complete OT {liveTime.otCompletedHours === 1 ? 'hour' : 'hours'} (₹{liveTime.otPay.toFixed(0)}). Next paid block at {8 + liveTime.otCompletedHours + 1}h 00m.
          </div>
        </div>
      )}
    </div>
  );
};
