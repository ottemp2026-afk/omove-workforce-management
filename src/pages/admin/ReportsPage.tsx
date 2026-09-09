import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  FileBarChart2, 
  Download, 
  Printer, 
  Calendar, 
  FileText, 
  Clock, 
  Users, 
  User, 
  Briefcase, 
  Zap, 
  IndianRupee, 
  Activity,
  CheckCircle2,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { parseDurationToMinutes, formatMinutesToHoursMinutes } from '../../utils/overtime';

export const ReportsPage: React.FC = () => {
  const { employees, shifts, attendanceRecords, addToast } = useAttendance();

  const [reportType, setReportType] = useState('Daily Attendance');
  const [selectedEmployee, setSelectedEmployee] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');

  // Filter records dynamically based on selections
  const filteredRecords = attendanceRecords.filter(r => {
    const matchEmp = selectedEmployee === 'ALL' || r.employeeId === selectedEmployee;
    const matchDept = selectedDepartment === 'ALL' || r.department === selectedDepartment;
    const matchShift = selectedShift === 'ALL' || r.shiftId === selectedShift || r.shift === selectedShift;
    return matchEmp && matchDept && matchShift;
  });

  // Dynamic calculations strictly from real Firestore records
  const totalPunches = filteredRecords.length;
  const completedCount = filteredRecords.filter(r => r.status === 'Completed').length;
  const complianceRate = totalPunches > 0 ? ((completedCount / totalPunches) * 100).toFixed(1) + '%' : '100%';

  const totalWorkMins = filteredRecords.reduce((sum, r) => sum + parseDurationToMinutes(r.workHours), 0);
  const cumulativeWorkHours = formatMinutesToHoursMinutes(totalWorkMins);

  const totalOtHours = filteredRecords.reduce((sum, r) => {
    if (typeof r.overtimeHours === 'number') return sum + r.overtimeHours;
    const match = String(r.overtimeHours || '').match(/(\d+)h/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);
  const totalOtPay = filteredRecords.reduce((sum, r) => sum + (r.overtimeAmount || r.otAmount || 0), 0);

  const reportModules = [
    { name: 'Daily Attendance', desc: 'Daily punch times & verification', accent: 'cyan' },
    { name: 'Employee History', desc: 'Personnel ledger & trends', accent: 'blue' },
    { name: 'Overtime Summary', desc: '1-hour blocks & extra time', accent: 'amber' },
    { name: 'Payroll & OT Payout', desc: 'Wage calculations at ₹80/hr', accent: 'emerald' },
  ];

  const handleGenerateReport = () => {
    addToast({
      type: 'success',
      title: 'Report Compiled',
      message: `${reportType} updated with ${filteredRecords.length} Firestore entries.`,
    });
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Shift', 'Work Hours', 'Overtime Hours', 'Overtime Pay (₹)', 'Status'];
    const rows = filteredRecords.map(r => [
      r.employeeId,
      `"${r.employeeName}"`,
      r.department || 'Operations',
      r.date,
      r.shift || 'General',
      r.workHours || '0h 00m',
      typeof r.overtimeHours === 'number' ? `${r.overtimeHours}h 00m` : r.overtimeHours,
      `₹${(r.overtimeAmount || r.otAmount || 0).toFixed(0)}`,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportType.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'CSV Exported',
      message: `${reportType} downloaded with real Firestore attendance data.`,
    });
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-7 pb-14">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workforce Audit & Reports
            </h1>
            <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-0.5 text-xs font-mono font-bold">
              Export Center
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Generate and export consolidated workforce attendance audits, overtime statements, and payroll sheets
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            id="reports-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-950" />
            <span>Export CSV</span>
          </button>
          <button
            id="reports-export-pdf-btn"
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-2xs active:scale-95 cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Configuration & Filter Form */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3 font-mono">
            SELECT AUDIT REPORT MODULE
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {reportModules.map(mod => {
              const isSelected = reportType === mod.name;
              return (
                <button
                  key={mod.name}
                  type="button"
                  onClick={() => setReportType(mod.name)}
                  className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white shadow-md'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FileText className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="font-bold text-sm leading-tight">{mod.name}</div>
                  <div className={`text-[11px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {mod.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4 border-t border-slate-100">
          {/* Employee Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
              EMPLOYEE SCOPE
            </label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Enrolled Employees ({employees.length})</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.employeeId || e.id})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
              DEPARTMENT SCOPE
            </label>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Production">Production</option>
              <option value="Assembly">Assembly</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Logistics">Logistics</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 font-mono">
              SHIFT ROTATION
            </label>
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 px-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Shift Cycles</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} – {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Summary StatCards for Reports */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-rep-records"
          title="TOTAL AUDIT LOGS"
          value={`${totalPunches} Punches`}
          subtitle="Indexed in current query filter"
          icon={Calendar}
          accentColor="blue"
          badge="LOGS"
        />
        <StatCard
          id="stat-rep-compliance"
          title="ATTENDANCE COMPLIANCE"
          value={complianceRate}
          subtitle="Ratio of completed shift cycles"
          icon={CheckCircle2}
          highlight={true}
          accentColor="emerald"
          badge="COMPLIANCE"
        />
        <StatCard
          id="stat-rep-hours"
          title="CUMULATIVE WORK"
          value={cumulativeWorkHours || '00h 00m'}
          subtitle="Total regular hours logged"
          icon={Clock}
          accentColor="purple"
          badge="HOURS"
        />
        <StatCard
          id="stat-rep-payout"
          title="OT COMPENSATION"
          value={`₹${totalOtPay.toFixed(0)}`}
          subtitle={`${totalOtHours} hrs • Calculated at ₹80/hr`}
          icon={IndianRupee}
          accentColor="amber"
          badge="PAYOUT"
        />
      </div>

      {/* Generated Report Preview Area */}
      <div className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                REPORT DOCUMENT PREVIEW
              </span>
              <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-600/60">
                Live Cloud Data
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
              {reportType}
            </h3>
          </div>

          <div className="text-xs text-slate-300 font-mono">
            Generated: <strong className="text-white">{new Date().toLocaleDateString('en-GB')}</strong> • ESP32 Biometric Logs
          </div>
        </div>

        {/* Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/90 text-slate-600 border-b border-slate-200 text-[10.5px] font-bold uppercase tracking-wider select-none">
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>STAFF MEMBER</span>
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>DATE</span>
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>TIMINGS</span>
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-slate-400" />
                    <span>HOURS WORKED</span>
                  </div>
                </th>
                <th className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-amber-500" />
                    <span>OVERTIME (₹)</span>
                  </div>
                </th>
                <th className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-slate-400" />
                    <span>STATUS</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length > 0 ? (
                filteredRecords.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-bold text-slate-900">{r.employeeName}</div>
                      <div className="text-[10.5px] text-slate-500 font-mono">{r.employeeId} • {r.department || 'Operations'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">
                      {r.date}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-800">
                      <div className="text-xs font-semibold">{r.inTime} → {r.outTime || '--:--'}</div>
                      <div className="text-[10px] text-slate-400">{r.shift || 'General'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {r.workHours || '0h 00m'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        ₹{(r.overtimeAmount || r.otAmount || 0).toFixed(0)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No matching attendance logs found for the selected scope.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
