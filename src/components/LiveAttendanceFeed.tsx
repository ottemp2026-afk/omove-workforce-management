import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from './StatusBadge';
import { Fingerprint } from 'lucide-react';

interface LiveAttendanceFeedProps {
  onOpenScanModal?: () => void;
}

export const LiveAttendanceFeed: React.FC<LiveAttendanceFeedProps> = ({ onOpenScanModal }) => {
  const { liveLogs, hardware } = useAttendance();

  return (
    <div
      id="live-attendance-section"
      className="rounded-md border border-slate-200 bg-white overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 p-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Live Biometric Feed</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
              ESP32 Stream
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric punch ledger synchronized with R307S optical sensor
          </p>
        </div>

        {onOpenScanModal && (
          <button
            id="live-feed-test-scan-btn"
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Fingerprint className="h-3.5 w-3.5 text-slate-500" />
            <span>Simulate Scan</span>
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2.5">Employee</th>
              <th className="px-4 py-2.5">Employee ID</th>
              <th className="px-4 py-2.5">Fingerprint ID</th>
              <th className="px-4 py-2.5">Scan Time</th>
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {liveLogs.map(log => {
              const isWorkIn = log.action === 'WORK IN';
              return (
                <tr
                  key={log.id}
                  id={`live-log-${log.id}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{log.employeeName}</div>
                    <div className="text-[10px] text-slate-400">{log.department}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700 font-medium">
                    {log.employeeId}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    FP-{log.fingerprintId}
                  </td>
                  <td className="px-4 py-2.5 text-slate-900 font-medium">
                    {log.time}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        isWorkIn
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={log.status} size="sm" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Feed */}
      <div className="sm:hidden divide-y divide-slate-100">
        {liveLogs.map(log => {
          const isWorkIn = log.action === 'WORK IN';
          return (
            <div key={log.id} className="p-3.5 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-slate-900">{log.employeeName}</h4>
                  <p className="text-[10px] text-slate-500">{log.employeeId} • FP-{log.fingerprintId}</p>
                </div>
                <StatusBadge status={log.status} size="sm" />
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span
                  className={`px-1.5 py-0.5 rounded font-medium ${
                    isWorkIn
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {log.action}
                </span>
                <span className="text-slate-600 font-medium">{log.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          <span>Synced with RTC: {hardware.lastSyncTime}</span>
        </span>
        <span className="text-[11px] text-slate-400">RSSI: {hardware.wifiRssi}</span>
      </div>
    </div>
  );
};
