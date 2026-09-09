import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { LiveAttendanceFeed } from '../components/LiveAttendanceFeed';
import { AppRoute } from '../types';
import { 
  Radio, 
  Cpu, 
  Fingerprint, 
  Clock, 
  Activity, 
  CheckCircle2, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface LiveLedgerPageProps {
  navigate: (route: AppRoute) => void;
  onOpenScanModal?: () => void;
}

export const LiveLedgerPage: React.FC<LiveLedgerPageProps> = ({ navigate, onOpenScanModal }) => {
  const { hardware, attendanceRecords, isFirebaseConnected } = useAttendance();

  // Metrics derived from live records
  const totalPunchesToday = attendanceRecords.length;
  const activeCount = attendanceRecords.filter(r => r.status === 'Working').length;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Executive Hero Banner for Live Ledger */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        {/* Ambient Neon Blurs */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-3 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Direct Hardware Telemetry • WebSocket Active</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Live Biometric Attendance Ledger
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Standalone real-time stream capturing live optical fingerprint punches from ESP32-WROOM-32 &amp; R307S terminals with millisecond RTC timestamps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/attendance')}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-sm shadow-xs active:scale-95"
            >
              <span>Personal Shift Records</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-pink-500/20 active:scale-95"
            >
              <span>Hardware Specs</span>
            </button>
          </div>
        </div>

        {/* Real-time Hardware Telemetry Bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">MCU:</span>
            <span className="font-bold text-white">ESP32 240MHz</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Sensor:</span>
            <span className="font-bold text-white">R307S 57600bps</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
            <span className="text-slate-400">RTC:</span>
            <span className="font-bold text-white">DS3231 ±2ppm</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <div className={`h-2 w-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span className="text-slate-400">Cloud Sync:</span>
            <span className="font-bold text-white">{isFirebaseConnected ? 'Firestore Online' : 'Syncing...'}</span>
          </div>
        </div>
      </div>

      {/* 4 Live Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Terminal Link</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Radio className="h-4 w-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">ONLINE</div>
            <p className="text-[11px] font-medium text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Full-duplex stream • &lt; 40ms</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/60 via-white to-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Punches Today</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{totalPunchesToday} Logged</div>
            <p className="text-[11px] font-medium text-blue-700 mt-0.5">
              {activeCount} staff currently working
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-purple-200/90 bg-gradient-to-br from-purple-50/60 via-white to-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">Biometric Match</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">99.4% Avg</div>
            <p className="text-[11px] font-medium text-purple-700 mt-0.5">
              FAR &lt; 0.001% • 1:N Search
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/60 via-white to-white p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Enrolled Templates</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Fingerprint className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {hardware.enrolledFingersCount} Slots
            </div>
            <p className="text-[11px] font-medium text-amber-700 mt-0.5">
              1,000 flash template storage
            </p>
          </div>
        </div>
      </div>

      {/* Main Live Attendance Feed Stream */}
      <div className="space-y-3">
        <LiveAttendanceFeed onOpenScanModal={onOpenScanModal} allowSimulate={true} />
      </div>
    </div>
  );
};
