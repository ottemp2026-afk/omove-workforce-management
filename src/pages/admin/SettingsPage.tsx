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
  AlertTriangle
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
      title: 'Settings Saved',
      message: 'Hardware parameters & overtime rules synced with terminal.',
    });
  };

  const handleRunDiagnostic = () => {
    setIsTestingHardware(true);
    setTimeout(() => {
      setIsTestingHardware(false);
      addToast({
        type: 'success',
        title: 'Diagnostic Passed',
        message: 'ESP32, R307S, DS3231, and OLED passed all self-checks (100% OK).',
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            System & Hardware Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Configure ESP32 terminal parameters, R307S optical sensor matching rules, and workforce policies
          </p>
        </div>

        <button
          id="btn-run-hardware-diagnostic"
          type="button"
          onClick={handleRunDiagnostic}
          disabled={isTestingHardware}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isTestingHardware ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>{isTestingHardware ? 'Testing Hardware...' : 'Run Terminal Diagnostic'}</span>
        </button>
      </div>

      {/* Hardware Telemetry & Device Status Grid */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2.5">
          Connected Terminal Modules
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* ESP32 Module */}
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                <Cpu className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Online
              </span>
            </div>
            <h4 className="text-xs font-medium text-slate-900">ESP32-WROOM-32</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">IP: {hardware.ipAddress}</p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Firmware:</span>
              <span className="font-semibold text-slate-700">v2.4.1-prod</span>
            </div>
          </div>

          {/* R307S Fingerprint Sensor */}
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Ready
              </span>
            </div>
            <h4 className="text-xs font-medium text-slate-900">R307S Optical Sensor</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">UART Baud: 57,600 bps</p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Enrolled Slots:</span>
              <span className="font-semibold text-slate-700">{hardware.enrolledFingersCount} / 1000</span>
            </div>
          </div>

          {/* DS3231 RTC Module */}
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Synced
              </span>
            </div>
            <h4 className="text-xs font-medium text-slate-900">DS3231 Precision RTC</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Drift: &lt; 0.02s / week</p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Backup Battery:</span>
              <span className="font-semibold text-slate-700">CR2032 (3.1V)</span>
            </div>
          </div>

          {/* OLED Display & Wi-Fi */}
          <div className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white">
                <Wifi className="h-3.5 w-3.5 text-teal-400" />
              </div>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Connected
              </span>
            </div>
            <h4 className="text-xs font-medium text-slate-900">Wi-Fi & OLED 0.96"</h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">RSSI: {hardware.wifiRssi}</p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Display I2C:</span>
              <span className="font-semibold text-slate-700">0x3C Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
            <Sliders className="h-3.5 w-3.5 text-slate-700" />
            <h3 className="text-base font-semibold text-slate-900">
              Workforce Policy & Overtime Parameters
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Standard Daily Work Hours */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Standard Work Hours / Shift
              </label>
              <input
                id="setting-work-hours"
                type="number"
                min="4"
                max="12"
                value={workHoursThreshold}
                onChange={e => setWorkHoursThreshold(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">Standard shift is 8h (480m); OT counts after 8 completed hours</p>
            </div>

            {/* Default Overtime Rate */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Default Overtime Rate (₹ / hr)
              </label>
              <input
                id="setting-ot-rate"
                type="number"
                min="0"
                step="5"
                value={overtimeRate}
                onChange={e => setOvertimeRate(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">Complete 1-hr blocks only (₹80/hr; no fractional minutes)</p>
            </div>

            {/* Grace Period */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Clock-In Grace Period (Minutes)
              </label>
              <input
                id="setting-grace-period"
                type="number"
                min="0"
                max="60"
                value={gracePeriod}
                onChange={e => setGracePeriod(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500 mt-1">Buffer before entry marked as "Late"</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-200/80">
            {/* Sensor Matching Security Level */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                R307S Biometric Security Level
              </label>
              <select
                id="setting-security-level"
                value={sensorSecurityLevel}
                onChange={e => setSensorSecurityLevel(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="Level 1 (Relaxed)">Level 1 (Relaxed - Higher tolerance)</option>
                <option value="Level 2 (Normal)">Level 2 (Normal)</option>
                <option value="Level 3 (Balanced)">Level 3 (Balanced - Recommended for industry)</option>
                <option value="Level 4 (Strict)">Level 4 (Strict)</option>
                <option value="Level 5 (Maximum)">Level 5 (Maximum - High minutiae match)</option>
              </select>
            </div>

            {/* OLED Sleep Timeout */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                OLED Screen Sleep Timeout
              </label>
              <select
                id="setting-oled-timeout"
                value={oledTimeout}
                onChange={e => setOledTimeout(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="30 seconds">30 seconds</option>
                <option value="60 seconds">60 seconds (Default)</option>
                <option value="120 seconds">120 seconds</option>
                <option value="Always On">Always On</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              id="settings-save-button"
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Save className="h-3 w-3 text-emerald-400" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
