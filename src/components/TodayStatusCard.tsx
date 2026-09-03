import React, { useState, useEffect, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from './StatusBadge';
import { Fingerprint, Clock, AlertCircle, CheckCircle2, LogOut, LogIn, Users } from 'lucide-react';
import { getElapsedWorkTime } from '../utils/overtime';

interface TodayStatusCardProps {
  onOpenScanModal: () => void;
}

export const TodayStatusCard: React.FC<TodayStatusCardProps> = ({ onOpenScanModal }) => {
  const { 
    todayWorkStatus, 
    todayInTime, 
    todayWorkHours, 
    todayOvertime, 
    todayInTimestamp, 
    selectedEmployee,
    shifts,
    simulateBiometricScan
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

  // Derive live elapsed work duration and overtime from IN timestamp
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

  const assignedShift = shifts.find(s => s.id === selectedEmployee?.shiftId || s.shiftId === selectedEmployee?.shiftId) || shifts[0] || {
    name: 'Shift A',
    startTime: '06:00',
    endTime: '14:00',
  };

  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleQuickClockOut = () => {
    if (selectedEmployee) {
      simulateBiometricScan(selectedEmployee.fingerprintId, 'WORK OUT');
    }
  };

  const handleQuickClockIn = () => {
    if (selectedEmployee) {
      simulateBiometricScan(selectedEmployee.fingerprintId, 'WORK IN');
    }
  };

  if (!selectedEmployee) {
    return (
      <div id="today-work-status-card" className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs text-center space-y-2">
        <Users className="h-8 w-8 text-slate-300 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-700">No Employee Selected</h3>
        <p className="text-xs text-slate-500">
          Please add or select an employee from the workforce directory to track attendance.
        </p>
      </div>
    );
  }

  return (
    <div
      id="today-work-status-card"
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition-all"
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900">
              Today's Attendance
            </h2>
            {todayWorkStatus === 'WORKING' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Shift
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Biometric punch & shift progression • {assignedShift.name} ({assignedShift.startTime} – {assignedShift.endTime})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {todayWorkStatus === 'WORKING' && (
            <button
              id="today-card-clock-out-button"
              type="button"
              onClick={handleQuickClockOut}
              className="inline-flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition-colors shadow-2xs"
              title="Perform Biometric WORK OUT and finalize shift duration"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Punch WORK OUT</span>
            </button>
          )}

          {todayWorkStatus === 'NOT STARTED' && selectedEmployee.status !== 'On Leave' && (
            <button
              id="today-card-clock-in-button"
              type="button"
              onClick={handleQuickClockIn}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition-colors shadow-2xs"
              title="Perform Biometric WORK IN and start live timer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Punch WORK IN</span>
            </button>
          )}

          <button
            id="today-card-biometric-scan-button"
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
            <span>Record Attendance</span>
          </button>
        </div>
      </div>

      {/* DEDICATED LIVE WORK-TIME BANNER (when status is WORKING) */}
      {todayWorkStatus === 'WORKING' && liveTime && (
        <div 
          id="live-work-timer-banner"
          className="mb-4 rounded-lg border border-slate-200 bg-slate-900 text-white p-4 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* IN punch context */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 border border-slate-700">
                <Clock className="h-5 w-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Live Shift Timer
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-800">
                    IN at {todayInTime}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Calculated from Firestore IN timestamp • Updates every second
                </p>
              </div>
            </div>

            {/* Live Counters */}
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {/* Counter 1: WORKED */}
              <div id="live-worked-counter" className="flex flex-col">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                  WORKED
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                    {liveTime.formattedWorked}
                  </span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Standard Shift: 08:00:00 (480m)
                </span>
              </div>

              {/* Counter 2: OVERTIME (After 8 completed hours) */}
              {liveTime.isOvertime ? (
                <div id="live-overtime-counter" className="flex flex-col pl-4 border-l border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400">
                      OVERTIME
                    </span>
                    <span className="rounded bg-amber-950/80 px-1.5 py-0.5 text-[9px] font-semibold text-amber-300 border border-amber-800">
                      {liveTime.otCompletedHours}h Paid
                    </span>
                  </div>
                  <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-amber-400 tabular-nums mt-0.5">
                    {liveTime.formattedOvertime}
                  </span>
                  <span className="text-[10px] text-amber-300/90 mt-0.5">
                    ₹{liveTime.otPay.toFixed(0)} • Complete 1-hour block rule
                  </span>
                </div>
              ) : (
                <div className="hidden sm:flex flex-col pl-4 border-l border-slate-800">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    OVERTIME
                  </span>
                  <span className="font-mono text-lg font-medium text-slate-500 tabular-nums mt-0.5">
                    00:00:00
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Begins after 8 completed hours
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5 Information Blocks: TODAY | WORK STATUS | IN TIME | WORKED | OVERTIME */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/70 text-xs">
        {/* 1. TODAY */}
        <div className="pt-2 sm:pt-0 sm:pr-4">
          <p className="text-slate-500 font-medium">TODAY</p>
          <p className="mt-1 font-semibold text-slate-900 text-sm">
            {todayFormatted}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {assignedShift.name} ({assignedShift.startTime} - {assignedShift.endTime})
          </p>
        </div>

        {/* 2. WORK STATUS */}
        <div className="pt-2 sm:pt-0 sm:px-4">
          <p className="text-slate-500 font-medium mb-1.5">WORK STATUS</p>
          <StatusBadge status={todayWorkStatus} size="sm" />
        </div>

        {/* 3. IN TIME */}
        <div className="pt-2 sm:pt-0 sm:px-4">
          <p className="text-slate-500 font-medium">IN TIME</p>
          <p className="mt-1 font-semibold text-slate-900 text-sm">
            {todayInTime}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {todayInTime !== '--:--' ? 'Biometric Verified (R307S)' : 'Awaiting punch'}
          </p>
        </div>

        {/* 4. WORKED */}
        <div className="pt-2 sm:pt-0 sm:px-4">
          <p className="text-slate-500 font-medium">WORKED</p>
          {todayWorkStatus === 'WORKING' && liveTime ? (
            <div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono font-bold text-slate-900 text-sm sm:text-base tabular-nums">
                  {liveTime.formattedWorked}
                </span>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                Live counter (sec)
              </p>
            </div>
          ) : todayWorkStatus === 'WORK COMPLETED' ? (
            <div>
              <p className="mt-1 font-semibold text-slate-900 text-sm">
                {todayWorkHours}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Shift completed & saved
              </p>
            </div>
          ) : (
            <div>
              <p className="mt-1 font-semibold text-slate-400 text-sm">
                00h 00m
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Standard 08h 00m
              </p>
            </div>
          )}
        </div>

        {/* 5. OVERTIME */}
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <p className="text-slate-500 font-medium">OVERTIME</p>
          {todayWorkStatus === 'WORKING' && liveTime ? (
            liveTime.isOvertime ? (
              <div>
                <p className="mt-1 font-mono font-bold text-amber-600 text-sm sm:text-base tabular-nums">
                  {liveTime.formattedOvertime}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {liveTime.otCompletedHours}h block • ₹{liveTime.otPay.toFixed(0)}
                </p>
              </div>
            ) : (
              <div>
                <p className="mt-1 font-mono font-medium text-slate-400 text-sm tabular-nums">
                  00:00:00
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Starts after 8h • ₹0
                </p>
              </div>
            )
          ) : todayWorkStatus === 'WORK COMPLETED' ? (
            <div>
              <p className="mt-1 font-semibold text-slate-900 text-sm">
                {todayOvertime}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                1-hr blocks • ₹{selectedEmployee.overtimeRate || 80}/hr
              </p>
            </div>
          ) : (
            <div>
              <p className="mt-1 font-semibold text-slate-400 text-sm">
                00h 00m
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                1-hr blocks • ₹{selectedEmployee.overtimeRate || 80}/hr
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Complete 1-Hour Block Policy Footnote */}
      {todayWorkStatus === 'WORKING' && liveTime?.isOvertime && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-md border border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900">Overtime Policy in Effect: </span>
            Overtime pay is granted strictly for complete 1-hour blocks (480m regular + 60m blocks). Current total minutes: {Math.floor(liveTime.elapsedSeconds / 60)}m → {liveTime.otCompletedHours} complete OT {liveTime.otCompletedHours === 1 ? 'hour' : 'hours'} (₹{liveTime.otPay.toFixed(0)}). Next paid block at {8 + liveTime.otCompletedHours + 1}h 00m.
          </div>
        </div>
      )}
    </div>
  );
};
