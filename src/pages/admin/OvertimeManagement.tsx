import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { OvertimeTable } from '../../components/OvertimeTable';
import { StatCard } from '../../components/StatCard';
import { DollarSign, Clock, Award, Users, TrendingUp } from 'lucide-react';

export const OvertimeManagement: React.FC = () => {
  const { attendanceRecords } = useAttendance();

  // Overtime statistics
  const overtimeRecords = attendanceRecords.filter(
    r => r.overtimeHours !== '00h 00m' || r.otAmount > 0
  );
  const totalOtPayout = overtimeRecords.reduce((sum, r) => sum + r.otAmount, 0);
  const totalOtHours = overtimeRecords.reduce((sum, r) => {
    const match = r.overtimeHours.match(/(\d+)h/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
  const totalOtHoursFormatted = `${String(totalOtHours).padStart(2, '0')}h 00m`;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Overtime & Compensation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Track overtime hours beyond 8-hour regular shifts, calculate employee payouts, and export compensation logs
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          id="stat-ot-total-payout"
          title="TOTAL OVERTIME PAYOUT"
          value={`₹${totalOtPayout.toFixed(2)}`}
          subtitle="Cycle: September 2026"
          icon={DollarSign}
          highlight={true}
        />
        <StatCard
          id="stat-ot-total-hours"
          title="TOTAL OVERTIME HOURS"
          value={totalOtHoursFormatted}
          subtitle="Complete 1-hour blocks only"
          icon={Clock}
        />
        <StatCard
          id="stat-ot-rate-avg"
          title="BASE OVERTIME RATE"
          value="₹80 / hr"
          subtitle="Standard company multiplier"
          icon={Award}
        />
        <StatCard
          id="stat-ot-qualifying-emp"
          title="QUALIFYING SHIFTS"
          value={`${overtimeRecords.length} records`}
          subtitle="Clocked overtime attendance"
          icon={Users}
        />
      </div>

      {/* Main Overtime Table */}
      <OvertimeTable records={attendanceRecords} />
    </div>
  );
};
