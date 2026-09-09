import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceTable } from '../../components/AttendanceTable';
import { StatCard } from '../../components/StatCard';
import { CalendarCheck, Users, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { parseDurationToMinutes, formatMinutesToHoursMinutes } from '../../utils/overtime';

export const AttendanceManagement: React.FC = () => {
  const { attendanceRecords, employees } = useAttendance();

  const completedRecords = attendanceRecords.filter(r => r.status === 'Completed');
  const totalMins = completedRecords.reduce((sum, r) => sum + parseDurationToMinutes(r.workHours), 0);
  const avgMins = completedRecords.length > 0 ? Math.round(totalMins / completedRecords.length) : 0;
  const avgWorkTimeFormatted = avgMins > 0 ? formatMinutesToHoursMinutes(avgMins) : '00h 00m';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Attendance Ledger
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Enterprise attendance records, biometric clock logs, and workforce time compliance from Firestore
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-md">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Firestore Real-Time Sync</span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          id="stat-records-total"
          title="TOTAL LOGGED RECORDS"
          value={attendanceRecords.length}
          subtitle="Indexed in Firestore attendance"
          icon={CalendarCheck}
          accentColor="blue"
          badge="LEDGER"
        />
        <StatCard
          id="stat-records-completed"
          title="COMPLETED SHIFTS"
          value={completedRecords.length}
          subtitle="Both Clock-In & Clock-Out captured"
          icon={CheckCircle2}
          highlight={true}
          accentColor="emerald"
          badge="CONFIRMED"
        />
        <StatCard
          id="stat-records-avg-work"
          title="AVG WORK DURATION"
          value={avgWorkTimeFormatted}
          subtitle="Calculated from completed records"
          icon={Clock}
          accentColor="purple"
          badge="AVERAGE"
        />
        <StatCard
          id="stat-records-total-emp"
          title="ACTIVE WORKFORCE"
          value={employees.filter(e => e.active !== false).length}
          subtitle="Active registered employees"
          icon={Users}
          accentColor="cyan"
          badge="STAFF"
        />
      </div>

      {/* Main Multi-Employee Attendance Table */}
      <AttendanceTable
        records={attendanceRecords}
        title="Company Workforce Attendance Log"
        subtitle="Historical records of employee punch times recorded in Firestore"
        showEmployeeName={true}
      />
    </div>
  );
};
