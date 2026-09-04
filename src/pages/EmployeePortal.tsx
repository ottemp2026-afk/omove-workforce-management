import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { EmployeeSelector } from '../components/EmployeeSelector';
import { TodayStatusCard } from '../components/TodayStatusCard';
import { EmployeeProfileCard } from '../components/EmployeeProfileCard';
import { AttendanceTable } from '../components/AttendanceTable';
import { AppRoute } from '../types';
import { Fingerprint, CalendarCheck } from 'lucide-react';

interface EmployeePortalProps {
  navigate: (route: AppRoute) => void;
  onOpenScanModal: () => void;
}

export const EmployeePortal: React.FC<EmployeePortalProps> = ({ navigate, onOpenScanModal }) => {
  const { selectedEmployee, attendanceRecords } = useAttendance();

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

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Employee Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            View your attendance, working hours and overtime.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="hero-view-all-attendance-btn"
            type="button"
            onClick={() => navigate('/attendance')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-slate-400" />
            <span>Full Ledger</span>
          </button>
          <button
            id="hero-scan-fingerprint-btn"
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
            <span>Record Attendance</span>
          </button>
        </div>
      </div>

      {/* Switch Active Employee Selector */}
      <EmployeeSelector />

      {/* Status Section: TODAY | WORK STATUS | IN TIME | WORKED | OVERTIME */}
      <TodayStatusCard onOpenScanModal={onOpenScanModal} />

      {/* Two-Column Employee Profile */}
      <EmployeeProfileCard />

      {/* Attendance History: Biometric Ledger */}
      <div>
        <AttendanceTable
          records={recentRecords}
          title="Recent Attendance"
          subtitle="Biometric ledger for the current pay period"
          showEmployeeName={false}
        />
      </div>
    </div>
  );
};
