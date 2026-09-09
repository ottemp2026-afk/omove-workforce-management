import React, { useState, useEffect, useRef } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Fingerprint, 
  Clock, 
  CheckCircle2, 
  Radio, 
  X, 
  ShieldCheck, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface LivePunchPopupProps {
  isAdmin?: boolean;
}

export const LivePunchPopup: React.FC<LivePunchPopupProps> = ({ isAdmin = true }) => {
  const { livePunchAlert, dismissLivePunchAlert } = useAttendance();
  const [progress, setProgress] = useState<number>(100);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const elapsedBeforePauseRef = useRef<number>(0);

  const TOTAL_DURATION_MS = 5000; // 5 seconds display

  useEffect(() => {
    if (!livePunchAlert) {
      setProgress(100);
      elapsedBeforePauseRef.current = 0;
      return;
    }

    startTimeRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
    setProgress(100);

    const updateProgress = () => {
      if (isPaused) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current + elapsedBeforePauseRef.current;
      const remainingRatio = Math.max(0, 1 - elapsed / TOTAL_DURATION_MS);
      setProgress(remainingRatio * 100);

      if (elapsed >= TOTAL_DURATION_MS) {
        dismissLivePunchAlert();
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [livePunchAlert, isPaused, dismissLivePunchAlert]);

  const handleMouseEnter = () => {
    setIsPaused(true);
    elapsedBeforePauseRef.current += Date.now() - startTimeRef.current;
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  };

  if (!livePunchAlert) return null;

  const isWorkIn = livePunchAlert.action === 'WORK IN';

  return (
    <div
      id="live-punch-popup"
      role="alert"
      aria-live="assertive"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-[420px] max-w-md pointer-events-auto transition-all animate-in slide-in-from-top-4 duration-300"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl bg-slate-950/95 text-white shadow-2xl transition-all ${
          isWorkIn
            ? 'border-emerald-500/40 shadow-emerald-950/50'
            : 'border-amber-500/40 shadow-amber-950/50'
        }`}
      >
        {/* Top Accent Gradient Laser Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            isWorkIn
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-[0_0_10px_#10b981]'
              : 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 shadow-[0_0_10px_#f59e0b]'
          }`}
        />

        {/* Ambient Glow Aura */}
        <div
          className={`pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full blur-2xl opacity-30 ${
            isWorkIn ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />

        <div className="p-4 sm:p-5">
          {/* Header Row: Live Radar Badge + Dismiss Button */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-tight shadow-xs ${
                isWorkIn
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isWorkIn ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isWorkIn ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </span>
              <span>{isWorkIn ? 'LIVE WORK IN DETECTED' : 'LIVE WORK OUT DETECTED'}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono">ESP32</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                {isPaused ? 'Paused' : `${Math.ceil((progress / 100) * 5)}s`}
              </span>
              <button
                id="close-live-punch-popup-btn"
                type="button"
                onClick={dismissLivePunchAlert}
                title="Dismiss (Esc)"
                className="rounded-lg p-1 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Employee & Punch Card Body */}
          <div className="flex items-start gap-3.5">
            {/* Avatar Pill */}
            <div className="relative shrink-0">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-black border shadow-md ${
                  isWorkIn
                    ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/70 border-amber-500/40 text-amber-300'
                }`}
              >
                {livePunchAlert.employeeName
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'EM'}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border border-slate-950 text-[9px] font-mono font-bold ${
                  isWorkIn ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
                title={`Sensor Slot FP-#${livePunchAlert.fingerprintId}`}
              >
                #{livePunchAlert.fingerprintId}
              </span>
            </div>

            {/* Information Column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">
                  {livePunchAlert.employeeName}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold shrink-0 ${
                    isWorkIn
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {livePunchAlert.action}
                </span>
              </div>

              {/* Department & ID */}
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>{livePunchAlert.department}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono text-slate-400">{livePunchAlert.employeeId}</span>
              </p>

              {/* Punch Telemetry Chips */}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                {/* Time */}
                <span className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-slate-300">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span>{livePunchAlert.time}</span>
                </span>

                {/* Match Score */}
                <span className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-emerald-400">
                  <Fingerprint className="h-3 w-3" />
                  <span>{livePunchAlert.matchScore}% Match</span>
                </span>

                {/* If WORK OUT: Worked Duration */}
                {livePunchAlert.workHours && (
                  <span className="inline-flex items-center gap-1 rounded bg-blue-950/60 border border-blue-500/30 px-2 py-0.5 text-blue-300 font-bold">
                    <span>Worked: {livePunchAlert.workHours}</span>
                  </span>
                )}

                {/* If WORK OUT and Overtime Logged */}
                {livePunchAlert.overtimeHours !== undefined && Number(livePunchAlert.overtimeHours) > 0 && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-amber-300 font-bold">
                    <span>+{livePunchAlert.overtimeHours}h OT (₹{livePunchAlert.overtimeAmount})</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Second Progress Countdown Line */}
        <div className="relative h-1 w-full bg-slate-800/80 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${
              isWorkIn
                ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                : 'bg-gradient-to-r from-amber-400 to-orange-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
