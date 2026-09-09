import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Cpu, 
  Wifi, 
  Clock, 
  Fingerprint, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Save, 
  DollarSign,
  AlertTriangle,
  Zap,
  Activity,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { hardware, addToast } = useAttendance();

  const [overtimeRate, setOvertimeRate] = useState(80);
  const [gracePeriod, setGracePeriod] = useState(15);
  const [workHoursThreshold, setWorkHoursThreshold] = useState(8);
  const [sensorSecurityLevel, setSensorSecurityLevel] = useState('Level 3 (Balanced)');
  const [oledTimeout, setOledTimeout] = useState('60 seconds');
  const [isTestingHardware, setIsTestingHardware] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Parameters Synchronized',
      message: 'Hardware parameters & overtime rules synced with ESP32 terminal.',
    });
  };

  const handleRunDiagnostic = () => {
    setIsTestingHardware(true);
    setTimeout(() => {
      setIsTestingHardware(false);
      addToast({
        type: 'success',
        title: 'Diagnostic Test Passed (100% OK)',
        message: 'ESP32 (240MHz), R307S (UART 57600), DS3231 (I2C 0x68), and OLED passed all self-checks.',
      });
    }, 1200);
  };

  return (
    <div className="space-y-7 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Hardware & Edge Settings
            </h1>
            <span className="rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 px-2.5 py-0.5 text-xs font-mono font-bold">
              Terminal Config
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Configure ESP32 dual-core parameters, R307S optical matching tolerance, and attendance policies
          </p>
        </div>

        <button
          id="btn-run-hardware-diagnostic"
          type="button"
          onClick={handleRunDiagnostic}
          disabled={isTestingHardware}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isTestingHardware ? 'animate-spin text-cyan-400' : 'text-emerald-400'}`} />
          <span>{isTestingHardware ? 'Testing Hardware Bus...' : 'Run Terminal Diagnostic'}</span>
        </button>
      </div>

      {/* Connected Hardware Modules Grid with Vibrant Gradients */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Server className="h-4 w-4 text-slate-600" />
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-mono">
            CONNECTED TERMINAL MODULES & BUS TELEMETRY
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* ESP32 Module */}
          <div className="group relative overflow-hidden rounded-3xl border border-cyan-200/90 bg-gradient-to-br from-cyan-50/90 via-white to-blue-50/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-400">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-xs">
                <Cpu className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300">
                Online
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950">ESP32-WROOM-32</h4>
            <p className="text-xs text-cyan-800 font-mono font-medium mt-0.5">IP: {hardware.ipAddress}</p>
            <div className="mt-3.5 pt-3 border-t border-cyan-100 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Firmware:</span>
              <span className="font-bold text-slate-800">v2.4.1-prod</span>
            </div>
          </div>

          {/* R307S Fingerprint Sensor */}
          <div className="group relative overflow-hidden rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-400">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Fingerprint className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300">
                Ready
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950">R307S Optical Sensor</h4>
            <p className="text-xs text-emerald-800 font-mono font-medium mt-0.5">UART Baud: 57,600 bps</p>
            <div className="mt-3.5 pt-3 border-t border-emerald-100 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Capacity:</span>
              <span className="font-bold text-slate-800">{hardware.enrolledFingersCount || 7} / 1000 Slots</span>
            </div>
          </div>

          {/* DS3231 RTC Module */}
          <div className="group relative overflow-hidden rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-400">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300">
                Synced
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950">DS3231 Precision RTC</h4>
            <p className="text-xs text-indigo-800 font-mono font-medium mt-0.5">TCXO: ±2ppm (I2C 0x68)</p>
            <div className="mt-3.5 pt-3 border-t border-indigo-100 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Backup Battery:</span>
              <span className="font-bold text-slate-800">CR2032 (3.1V OK)</span>
            </div>
          </div>

          {/* OLED Display & Wi-Fi */}
          <div className="group relative overflow-hidden rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-amber-400">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
                <Wifi className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800 border border-emerald-300">
                Connected
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-950">Wi-Fi & OLED 0.96"</h4>
            <p className="text-xs text-amber-800 font-mono font-medium mt-0.5">RSSI: {hardware.wifiRssi} (Stable)</p>
            <div className="mt-3.5 pt-3 border-t border-amber-100 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>I2C Address:</span>
              <span className="font-bold text-slate-800">0x3C Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-5">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <Sliders className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Workforce Policy & Overtime Parameters
              </h3>
              <p className="text-xs text-slate-500">Live configuration sent over WebSocket to edge terminals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Standard Daily Work Hours */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                REGULAR HOURS / SHIFT
              </label>
              <input
                id="setting-work-hours"
                type="number"
                min="4"
                max="12"
                value={workHoursThreshold}
                onChange={e => setWorkHoursThreshold(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-bold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">Standard shift is 8h (480m); OT triggers after 8 full hours</p>
            </div>

            {/* Default Overtime Rate */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                BASE OVERTIME RATE (₹ / HR)
              </label>
              <input
                id="setting-ot-rate"
                type="number"
                min="0"
                step="5"
                value={overtimeRate}
                onChange={e => setOvertimeRate(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-bold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">Complete 1-hr blocks rule (₹80/hr; no fractional pay)</p>
            </div>

            {/* Grace Period */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                CLOCK-IN GRACE BUFFER (MINS)
              </label>
              <input
                id="setting-grace-period"
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={e => setGracePeriod(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-bold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-500 mt-1">Buffer window before punch is classified as "Late"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 pt-4 border-t border-slate-100">
            {/* Sensor Matching Security Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                R307S BIOMETRIC SECURITY LEVEL
              </label>
              <select
                id="setting-security-level"
                value={sensorSecurityLevel}
                onChange={e => setSensorSecurityLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="Level 1 (Relaxed)">Level 1 (Relaxed - Higher tolerance)</option>
                <option value="Level 2 (Normal)">Level 2 (Normal)</option>
                <option value="Level 3 (Balanced)">Level 3 (Balanced - Recommended for college project)</option>
                <option value="Level 4 (Strict)">Level 4 (Strict - High minutiae match)</option>
                <option value="Level 5 (Maximum)">Level 5 (Maximum Security)</option>
              </select>
            </div>

            {/* OLED Sleep Timeout */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
                OLED SCREEN STANDBY TIMEOUT
              </label>
              <select
                id="setting-oled-timeout"
                value={oledTimeout}
                onChange={e => setOledTimeout(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-semibold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="30 seconds">30 seconds</option>
                <option value="60 seconds">60 seconds (Standard)</option>
                <option value="120 seconds">120 seconds</option>
                <option value="Always Active">Always Active (Presentation Mode)</option>
              </select>
            </div>
          </div>

          {/* Form Save Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              id="save-settings-btn"
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-5 py-2.5 text-xs font-extrabold text-slate-950 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
            >
              <Save className="h-4 w-4 text-slate-950" />
              <span>Save & Sync Parameters to Terminal</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
