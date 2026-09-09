import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { EmployeeSelector } from '../components/EmployeeSelector';
import { TodayStatusCard } from '../components/TodayStatusCard';
import { EmployeeProfileCard } from '../components/EmployeeProfileCard';
import { AttendanceTable } from '../components/AttendanceTable';
import { LiveAttendanceFeed } from '../components/LiveAttendanceFeed';
import { AppRoute } from '../types';
import { 
  CalendarCheck, 
  Sparkles, 
  Clock, 
  Fingerprint, 
  Activity, 
  ShieldCheck, 
  ChevronRight,
  Wifi,
  Cpu,
  Radio,
  Zap,
  RadioTower
} from 'lucide-react';

import { formatTo12Hour } from '../utils/overtime';

interface EmployeePortalProps {
  navigate: (route: AppRoute) => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ navigate }) => {
  const { selectedEmployee, attendanceRecords, shifts, todayWorkStatus, hardware } = useAttendance();

  // Live real-time clock updating every second
  const [now, setNow] = useState<Date>(() => new Date());
  // Toggle between 12-Hour (AM/PM) and 24-Hour format (default: 12-Hour)
  const [is24Hour, setIs24Hour] = useState<boolean>(false);
  // Toggle between Live Hardware Ledger (ESP32 Stream) and Personal Attendance History
  const [ledgerMode, setLedgerMode] = useState<'LIVE' | 'HISTORY'>('LIVE');

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Contextual greeting based on hour
  const currentHour = now.getHours();
  const greeting = 
    currentHour < 12 
      ? 'Good morning' 
      : currentHour < 17 
        ? 'Good afternoon' 
        : 'Good evening';

  // Live real-time clock formatting in 12-hour (e.g. 10:15:34 PM) or 24-hour
  const timeHours = now.getHours();
  const timeMinutes = String(now.getMinutes()).padStart(2, '0');
  const timeSeconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = timeHours >= 12 ? 'PM' : 'AM';
  const displayHours12 = String(timeHours % 12 || 12).padStart(2, '0');
  const displayHours24 = String(timeHours).padStart(2, '0');

  const formattedTime = is24Hour
    ? `${displayHours24}:${timeMinutes}:${timeSeconds}`
    : `${displayHours12}:${timeMinutes}:${timeSeconds}`;

  const formattedDate = now.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Filter this employee's recent attendance
  const recentRecords = selectedEmployee
    ? attendanceRecords
        .filter(r => 
          r.employeeId === selectedEmployee.id || 
          r.employeeId === selectedEmployee.employeeId ||
          (selectedEmployee.fingerprintId && Number(r.fingerprintId) === Number(selectedEmployee.fingerprintId))
        )
        .slice(0, 5)
    : [];

  const assignedShift = shifts.find(
    s => s.id === selectedEmployee?.shiftId || s.shiftId === selectedEmployee?.shiftId
  ) || shifts[0] || {
    name: 'Shift A',
    startTime: '06:00',
    endTime: '14:00',
  };

  const handleScrollToLedger = (mode: 'LIVE' | 'HISTORY') => {
    setLedgerMode(mode);
    const el = document.getElementById('employee-portal-ledger-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-7 pb-14">
      {/* ================= ULTRA-PREMIUM EXECUTIVE HERO BANNER ================= */}
      <div 
        id="employee-portal-hero"
        className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/95 text-white shadow-2xl p-6 sm:p-8"
      >
        {/* Ambient background glow & radial highlights */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px]" />
        
        {/* Subtle decorative background watermark */}
        <div className="pointer-events-none absolute right-6 bottom-4 opacity-[0.04] text-white select-none">
          <Fingerprint className="h-72 w-72 stroke-[0.8]" />
        </div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left Column: Greeting, Employee Name, and Subtitle */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold tracking-wide text-amber-300 border border-amber-500/30 shadow-2xs backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>{greeting}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/90 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/50 shadow-xs shadow-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  ESP32 IoT Terminal Online
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                  <span>{selectedEmployee ? selectedEmployee.name : 'Omove Workforce Portal'}</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                  Enterprise Biometric Attendance Ledger • <strong className="text-emerald-300 font-semibold">{assignedShift.name} ({formatTo12Hour(assignedShift.startTime)} – {formatTo12Hour(assignedShift.endTime)})</strong> • Synchronized with DS3231 RTC.
                </p>
              </div>

              {/* Status Chips with Vibrant Themes */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-mono">
                <div className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 text-slate-300 shadow-2xs">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-slate-400 font-sans">Shift:</span>
                  <span className="font-bold text-white">
                    {todayWorkStatus === 'WORKING' ? '🟢 Active Shift' : todayWorkStatus === 'WORK COMPLETED' ? '✓ Shift Completed' : '○ Standby'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 text-cyan-300 shadow-2xs">
                  <Fingerprint className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-cyan-400/80 font-sans">Sensor Slot:</span>
                  <span className="font-bold">
                    FP-#{selectedEmployee?.fingerprintId || '1'}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 text-amber-300 shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-amber-400/80 font-sans">Overtime:</span>
                  <span className="font-bold">
                    ₹{selectedEmployee?.overtimeRate || 80}/hr (1-hr blocks)
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Seconds Clock & Quick Ledger Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 border-slate-800 pt-4 lg:pt-0 w-full lg:w-auto">
              {/* Digital Timepiece Card */}
              <div 
                id="hero-digital-timepiece"
                className="flex flex-col items-start sm:items-end bg-slate-900/95 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 backdrop-blur-md shadow-xl w-full sm:w-auto transition-all"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400 animate-pulse shrink-0" />
                  <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400 tabular-nums">
                    {formattedTime}
                  </span>
                  {!is24Hour && (
                    <span className="text-xs font-black uppercase text-amber-300 bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded-md font-mono tracking-wider shadow-2xs">
                      {ampm}
                    </span>
                  )}
                  <span className="text-[10px] uppercase font-bold text-emerald-950 bg-emerald-400 px-1.5 py-0.5 rounded font-mono">
                    IST
                  </span>
                  <button
                    type="button"
                    onClick={() => setIs24Hour(!is24Hour)}
                    title={`Click to switch to ${is24Hour ? '12-Hour (AM/PM)' : '24-Hour'} format`}
                    className="ml-1 text-[9px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
                  >
                    {is24Hour ? '24H' : '12H'}
                  </button>
                </div>
                <span className="text-xs font-medium text-slate-400 mt-1">
                  {formattedDate}
                </span>
              </div>

              {/* Action Buttons: Live Ledger & Full History */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  id="hero-view-live-ledger-btn"
                  type="button"
                  onClick={() => navigate('/live-ledger')}
                  className="group flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/25 transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <Radio className="h-4 w-4 text-slate-950 animate-pulse" />
                  <span>View Live Ledger</span>
                </button>

                <button
                  id="hero-view-all-attendance-btn"
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="group flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-700 shadow-sm transition-all duration-200 hover:border-slate-600 cursor-pointer active:scale-95"
                >
                  <CalendarCheck className="h-4 w-4 text-cyan-400" />
                  <span>Full Ledger</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Switch Active Employee Selector */}
      <EmployeeSelector />

      {/* Status Section: TODAY | WORK STATUS | IN TIME | WORKED | OVERTIME */}
      <TodayStatusCard />

      {/* Two-Column Employee Profile */}
      <EmployeeProfileCard />

      {/* ================= LIVE LEDGER / ATTENDANCE SECTION ================= */}
      <div id="employee-portal-ledger-section" className="space-y-4 pt-2">
        {/* Interactive Mode Toggle Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {/* Tab 1: Live Biometric Punch Stream */}
            <button
              id="tab-btn-live-stream"
              type="button"
              onClick={() => setLedgerMode('LIVE')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                ledgerMode === 'LIVE'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${ledgerMode === 'LIVE' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span>Live Biometric Ledger</span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.2 text-[9.5px] font-mono">
                LIVE STREAM
              </span>
            </button>

            {/* Tab 2: Personal Attendance History */}
            <button
              id="tab-btn-my-history"
              type="button"
              onClick={() => setLedgerMode('HISTORY')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-extrabold transition-all cursor-pointer ${
                ledgerMode === 'HISTORY'
                  ? 'bg-slate-950 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CalendarCheck className={`h-3.5 w-3.5 ${ledgerMode === 'HISTORY' ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>Personal Shift Records</span>
              <span className="rounded-full bg-slate-200 text-slate-700 px-2 py-0.2 text-[9.5px] font-mono">
                {recentRecords.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {ledgerMode === 'LIVE' 
                ? 'R307S UART 57600 baud stream active' 
                : `Filtered for ${selectedEmployee?.name}`}
            </span>
          </div>
        </div>

        {/* Content Render: Either Live Biometric Feed or Personal History Table */}
        {ledgerMode === 'LIVE' ? (
          <LiveAttendanceFeed allowSimulate={false} />
        ) : (
          <AttendanceTable
            records={recentRecords}
            title={`Attendance History for ${selectedEmployee?.name}`}
            subtitle="Biometric scan records and verified shift timings from Cloud Firestore"
            showEmployeeName={false}
          />
        )}
      </div>
    </div>
  );
};
