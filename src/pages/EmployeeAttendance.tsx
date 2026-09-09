import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceTable } from '../components/AttendanceTable';
import { EmployeeSelector } from '../components/EmployeeSelector';
import { StatCard } from '../components/StatCard';
import { LiveAttendanceFeed } from '../components/LiveAttendanceFeed';
import { CalendarCheck, Clock, DollarSign, Award, Calendar, Users, Radio } from 'lucide-react';
import { AppRoute } from '../types';
import { parseDurationToMinutes, formatMinutesToHoursMinutes } from '../utils/overtime';

interface EmployeeAttendanceProps {
  navigate: (route: AppRoute) => void;
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = () => {
  const { selectedEmployee, attendanceRecords } = useAttendance();
  const [ledgerMode, setLedgerMode] = useState<'HISTORY' | 'LIVE'>('HISTORY');

  if (!selectedEmployee) {
    return (
      <div className="py-12 text-center space-y-3">
        <Users className="h-10 w-10 text-slate-300 mx-auto" />
        <h2 className="text-base font-semibold text-slate-800">No Employee Selected</h2>
        <p className="text-xs text-slate-500">Please enroll an employee in Firestore to view attendance ledgers.</p>
      </div>
    );
  }

  // Employee-specific records
  const myRecords = attendanceRecords.filter(
    r => 
      r.employeeId === selectedEmployee.id || 
      r.employeeId === selectedEmployee.employeeId ||
      (selectedEmployee.fingerprintId && Number(r.fingerprintId) === Number(selectedEmployee.fingerprintId))
  );

  // Computed metrics for this employee
  const completedDays = myRecords.filter(r => r.status === 'Completed').length;
  
  // Total work hours
  const totalWorkMinutes = myRecords.reduce(
    (sum, r) => sum + parseDurationToMinutes(r.workHours),
    0
  );
  const totalWorkHoursFormatted = formatMinutesToHoursMinutes(totalWorkMinutes);

  // Overtime: Complete 1-hour blocks only
  const totalOvertimeHours = myRecords.reduce((acc, curr) => {
    if (typeof curr.overtimeHours === 'number') {
      return acc + curr.overtimeHours;
    }
    const match = String(curr.overtimeHours || '').match(/(\d+)h/);
    if (!match) return acc;
    return acc + parseInt(match[1], 10);
  }, 0);
  const totalOtPay = myRecords.reduce((sum, r) => sum + (r.overtimeAmount || r.otAmount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Personal Attendance Record</span>
              {ledgerMode === 'LIVE' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-mono font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Stream
                </span>
              )}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Biometric attendance log, verified shifts, and realtime hardware punch stream
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              id="attendance-live-ledger-toggle-btn"
              type="button"
              onClick={() => setLedgerMode(ledgerMode === 'LIVE' ? 'HISTORY' : 'LIVE')}
              className={`flex-1 sm:flex-initial justify-center inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs ${
                ledgerMode === 'LIVE'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Radio className={`h-3.5 w-3.5 ${ledgerMode === 'LIVE' ? 'text-white animate-pulse' : 'text-emerald-400'}`} />
              <span>{ledgerMode === 'LIVE' ? 'Personal Records' : '⚡ Live Biometric Ledger'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Firestore Real-Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Quick Info */}
      <EmployeeSelector />

      {/* Employee Personal Attendance Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          id="stat-emp-days"
          title="DAYS PRESENT"
          value={`${completedDays} Days`}
          subtitle="Shifts clocked via biometric scan"
          icon={CalendarCheck}
          highlight={true}
          accentColor="emerald"
          badge="PRESENT"
        />
        <StatCard
          id="stat-emp-hours"
          title="TOTAL WORK HOURS"
          value={totalWorkHoursFormatted || '00h 00m'}
          subtitle="Standard shift: 8h / 480m"
          icon={Clock}
          accentColor="blue"
          badge="SHIFT"
        />
        <StatCard
          id="stat-emp-ot-hours"
          title="OVERTIME LOGGED"
          value={`${totalOvertimeHours} hrs`}
          subtitle={`Complete 1-hr blocks • ₹${selectedEmployee.overtimeRate || 80}/hr`}
          icon={Award}
          accentColor="amber"
          badge="OVERTIME"
        />
        <StatCard
          id="stat-emp-ot-pay"
          title="OVERTIME EARNINGS"
          value={`₹${totalOtPay.toFixed(0)}`}
          subtitle="Processed with monthly payroll"
          icon={DollarSign}
          accentColor="cyan"
          badge="EARNINGS"
        />
      </div>

      {/* Mode Switcher Tabs Bar */}
      <div id="attendance-ledger-tabs" className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {/* Tab 1: Personal Attendance Records */}
            <button
              id="tab-btn-personal-records"
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
                {myRecords.length}
              </span>
            </button>

            {/* Tab 2: Live Biometric Hardware Ledger */}
            <button
              id="tab-btn-live-biometric-feed"
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
                STREAM LIVE
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {ledgerMode === 'LIVE' 
                ? 'R307S Real-time punch feed (View only)' 
                : `Verified records for ${selectedEmployee.name}`}
            </span>
          </div>
        </div>

        {/* Dynamic Display: Table or Live Feed */}
        {ledgerMode === 'HISTORY' ? (
          <AttendanceTable
            records={myRecords}
            title={`Attendance History for ${selectedEmployee.name}`}
            subtitle={`Employee ID: ${selectedEmployee.employeeId || selectedEmployee.id} • Assigned to ${selectedEmployee.shiftName}`}
            showEmployeeName={false}
          />
        ) : (
          <LiveAttendanceFeed allowSimulate={false} />
        )}
      </div>
    </div>
  );
};
