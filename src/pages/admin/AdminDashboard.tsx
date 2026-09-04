import React from 'react';
import { useAttendance, getTodayDateStr } from '../../context/AttendanceContext';
import { StatCard } from '../../components/StatCard';
import { LiveAttendanceFeed } from '../../components/LiveAttendanceFeed';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Fingerprint,
  UserPlus,
  Download,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { AppRoute } from '../../types';
import { parseDurationToMinutes, formatMinutesToHoursMinutes } from '../../utils/overtime';

interface AdminDashboardProps {
  navigate: (route: AppRoute) => void;
  onOpenScanModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate, onOpenScanModal }) => {
  const { employees, shifts, attendanceRecords, isFirebaseConnected, firestoreError } = useAttendance();

  // 1. Total Employees (from Firestore employees collection)
  const totalEmployees = employees.length;

  // 2. Active Employees (active === true)
  const activeEmployees = employees.filter(e => e.active !== false).length;

  // 3. Currently Working (real status === 'Working' from Firestore attendance)
  const currentlyWorking = attendanceRecords.filter(r => r.status === 'Working').length;

  // 4. Today's Attendance (records for current date)
  const todayDate = getTodayDateStr();
  const todayRecords = attendanceRecords.filter(r => r.date === todayDate);
  const todayAttendanceCount = todayRecords.length;

  // 5. Today's Overtime (sum of completed OT hours today)
  const totalOtHoursToday = todayRecords.reduce((sum, r) => {
    if (typeof r.overtimeHours === 'number') {
      return sum + r.overtimeHours;
    }
    const match = String(r.overtimeHours || '').match(/(\d+)h/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
  const todayOvertimeFormatted = `${String(totalOtHoursToday).padStart(2, '0')}h 00m`;

  // 6. Estimated/Recorded OT Payout (sum of otAmount for today)
  const todayOtPayout = todayRecords.reduce((sum, r) => sum + (r.overtimeAmount || r.otAmount || 0), 0);

  // Cumulative Work Time
  const totalWorkMinsToday = todayRecords.reduce((sum, r) => sum + parseDurationToMinutes(r.workHours), 0);
  const totalWorkHoursFormatted = formatMinutesToHoursMinutes(totalWorkMinsToday);

  const handleExportReport = () => {
    const headers = ['Date', 'Employee', 'Employee ID', 'Shift', 'IN', 'OUT', 'Hours', 'OT Hours', 'OT Pay', 'Status'];
    const rows = attendanceRecords.map(r => [
      r.date,
      `"${r.employeeName}"`,
      r.employeeId,
      r.shift,
      r.inTime,
      r.outTime || '--:--',
      r.workHours,
      r.overtimeHours,
      `₹${r.overtimeAmount || r.otAmount || 0}`,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workforce_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Workforce Overview
            </h1>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
              isFirebaseConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              {isFirebaseConnected ? 'Firestore Synced' : 'Syncing Firestore'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time biometric attendance metrics, active shifts, and Firestore synchronizations
          </p>
        </div>

        {/* Quick Action Buttons: Add Employee, Simulate Biometric Scan, Export Report */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="admin-dash-add-employee-btn"
            type="button"
            onClick={() => navigate('/admin/employees')}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <UserPlus className="h-3.5 w-3.5 text-slate-500" />
            <span>Add Employee</span>
          </button>
          <button
            id="admin-dash-scan-button"
            type="button"
            onClick={onOpenScanModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <Fingerprint className="h-3.5 w-3.5 text-emerald-400" />
            <span>Record Attendance</span>
          </button>
          <button
            id="admin-dash-export-report-btn"
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Sync / Permission Notice Banner */}
      {firestoreError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-950">Firebase Sync Notice</p>
            <p className="mt-0.5 text-slate-700 leading-relaxed">
              {firestoreError}
            </p>
          </div>
        </div>
      )}

      {/* Top Statistics Grid - Directly matching Section 16 */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2.5">
          Workforce & Attendance Metrics (Real-time Firestore)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {/* 1. Total Employees */}
          <StatCard
            id="stat-total-employees"
            title="TOTAL EMPLOYEES"
            value={totalEmployees}
            subtitle="Registered in Firestore"
            icon={Users}
          />
          {/* 2. Active Employees */}
          <StatCard
            id="stat-active-employees"
            title="ACTIVE EMPLOYEES"
            value={activeEmployees}
            subtitle="active: true"
            icon={UserCheck}
          />
          {/* 3. Currently Working */}
          <StatCard
            id="stat-currently-working"
            title="CURRENTLY WORKING"
            value={currentlyWorking}
            subtitle="Status: Working"
            icon={Clock}
            highlight={currentlyWorking > 0}
          />
          {/* 4. Today's Attendance */}
          <StatCard
            id="stat-today-attendance"
            title="TODAY'S ATTENDANCE"
            value={todayAttendanceCount}
            subtitle={todayDate}
            icon={CalendarCheck}
          />
          {/* 5. Today's Overtime */}
          <StatCard
            id="stat-today-overtime"
            title="TODAY'S OVERTIME"
            value={todayOvertimeFormatted}
            subtitle="Complete 1-hr blocks"
            icon={Briefcase}
          />
          {/* 6. Estimated/Recorded OT Payout */}
          <StatCard
            id="stat-today-ot-payout"
            title="TODAY'S OT PAYOUT"
            value={`₹${todayOtPayout.toFixed(0)}`}
            subtitle="Calculated at ₹80/hr"
            icon={DollarSign}
            highlight={todayOtPayout > 0}
          />
        </div>
      </div>

      {/* Real-time Attendance Activity */}
      <div className="grid grid-cols-1 gap-6">
        <LiveAttendanceFeed />
      </div>
    </div>
  );
};
