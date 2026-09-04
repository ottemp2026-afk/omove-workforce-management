import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceTable } from '../components/AttendanceTable';
import { EmployeeSelector } from '../components/EmployeeSelector';
import { StatCard } from '../components/StatCard';
import { CalendarCheck, Clock, DollarSign, Award, Calendar, Users } from 'lucide-react';
import { AppRoute } from '../types';
import { parseDurationToMinutes, formatMinutesToHoursMinutes } from '../utils/overtime';

interface EmployeeAttendanceProps {
  navigate: (route: AppRoute) => void;
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = () => {
  const { selectedEmployee, attendanceRecords } = useAttendance();

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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Personal Attendance Record
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Biometric attendance log, verified shifts, and overtime calculations
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Firestore Real-Time Ledger</span>
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
        />
        <StatCard
          id="stat-emp-hours"
          title="TOTAL WORK HOURS"
          value={totalWorkHoursFormatted || '00h 00m'}
          subtitle="Standard shift: 8h / 480m"
          icon={Clock}
        />
        <StatCard
          id="stat-emp-ot-hours"
          title="OVERTIME LOGGED"
          value={`${totalOvertimeHours} hrs`}
          subtitle={`Complete 1-hr blocks • ₹${selectedEmployee.overtimeRate || 80}/hr`}
          icon={Award}
        />
        <StatCard
          id="stat-emp-ot-pay"
          title="OVERTIME EARNINGS"
          value={`₹${totalOtPay.toFixed(0)}`}
          subtitle="Processed with monthly payroll"
          icon={DollarSign}
        />
      </div>

      {/* Main Attendance Table */}
      <AttendanceTable
        records={myRecords}
        title={`Attendance History for ${selectedEmployee.name}`}
        subtitle={`Employee ID: ${selectedEmployee.employeeId || selectedEmployee.id} • Assigned to ${selectedEmployee.shiftName}`}
        showEmployeeName={false}
      />
    </div>
  );
};
