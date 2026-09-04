import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
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
  Activity
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

  const reportTypes = [
    'Daily Attendance',
    'Employee Attendance History',
    'Overtime Summary',
    'Payroll & OT Payout',
  ];

  const handleGenerateReport = () => {
    addToast({
      type: 'success',
      title: 'Report Generated',
      message: `${reportType} updated with ${filteredRecords.length} Firestore entries.`,
    });
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Date', 'Shift', 'Work Hours', 'Overtime Hours', 'Overtime Pay (₹)', 'Status'];
    const rows = filteredRecords.map(r => [
      r.employeeId,
      `"${r.employeeName}"`,
      r.department,
      r.date,
      r.shift,
      r.workHours,
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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Workforce Reports
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Generate and export consolidated workforce attendance audits, overtime calculations, and compliance statements from Firestore
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reports-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            id="reports-export-pdf-btn"
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* Configuration & Filter Form */}
      <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-2">
            Select Report Module
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {reportTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setReportType(type)}
                className={`rounded-md border p-2.5 text-xs font-medium text-left transition-colors ${
                  reportType === type
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FileText className={`h-3.5 w-3.5 mb-1.5 ${reportType === type ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-3 border-t border-slate-200/80">
          {/* Employee Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Employee Filter
            </label>
            <select
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Employees ({employees.length})</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.id})
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Department Filter
            </label>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Departments</option>
              <option value="Production">Production</option>
              <option value="Assembly">Assembly</option>
              <option value="Quality Control">Quality Control</option>
              <option value="Logistics">Logistics</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          {/* Shift Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Shift Filter
            </label>
            <select
              value={selectedShift}
              onChange={e => setSelectedShift(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Shifts</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime} – {s.endTime})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end pt-2">
          <button
            id="reports-generate-btn"
            type="button"
            onClick={handleGenerateReport}
            className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            <FileBarChart2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Generated Report Preview Area */}
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <div className="border-b border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Report Document Preview
              </span>
              <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                Live Firestore Data
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-900 mt-0.5">
              {reportType}
            </h3>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Generated: {new Date().toLocaleDateString('en-GB')} • ESP32 Biometric Logs
          </div>
        </div>

        {/* Preview Summary Grid - 100% Real Numbers from Firestore */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-slate-200/80 text-xs">
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-2.5">
            <span className="text-slate-500 text-[11px] block">Total Records</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">{totalPunches} Punches</span>
          </div>
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-2.5">
            <span className="text-slate-500 text-[11px] block">Attendance Compliance</span>
            <span className="text-base font-semibold text-emerald-700 mt-0.5 block">{complianceRate}</span>
          </div>
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-2.5">
            <span className="text-slate-500 text-[11px] block">Cumulative Work Hours</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">{cumulativeWorkHours || '00h 00m'}</span>
          </div>
          <div className="rounded-md border border-slate-200/80 bg-slate-50/50 p-2.5">
            <span className="text-slate-500 text-[11px] block">Total Overtime Calculated</span>
            <span className="text-base font-semibold text-slate-900 mt-0.5 block">₹{totalOtPay.toFixed(0)}</span>
            <span className="text-[10px] text-slate-500 mt-0.5 block font-normal">{totalOtHours} completed hrs (₹80/hr)</span>
          </div>
        </div>

        {/* Preview Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-slate-200 border-b-2 border-slate-800 text-[11px] font-bold uppercase tracking-wider select-none">
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="tracking-widest">EMPLOYEE</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="tracking-widest">DATE</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    <span className="tracking-widest">SHIFT</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Clock className="h-3.5 w-3.5 text-indigo-300" />
                    <span className="tracking-widest">WORK HOURS</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                      <Zap className="h-2.5 w-2.5" />
                    </span>
                    <span className="font-bold text-amber-400 tracking-widest">OT HOURS</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <IndianRupee className="h-2.5 w-2.5" />
                    </span>
                    <span className="font-bold text-emerald-400 tracking-widest">OT PAY</span>
                  </div>
                </th>
                <th className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Activity className="h-3.5 w-3.5 text-sky-400" />
                    <span className="tracking-widest">STATUS</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No attendance records found matching the selected report filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.slice(0, 10).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2.5 font-medium text-slate-900">
                      {r.employeeName} <span className="font-mono text-slate-400">({r.employeeId})</span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">{r.date}</td>
                    <td className="px-4 py-2.5 text-slate-700">{r.shift}</td>
                    <td className="px-4 py-2.5 text-slate-900 font-semibold">{r.workHours}</td>
                    <td className="px-4 py-2.5 text-emerald-700 font-semibold">
                      {typeof r.overtimeHours === 'number' ? `${r.overtimeHours}h 00m` : r.overtimeHours}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      ₹{(r.overtimeAmount || r.otAmount || 0).toFixed(0)}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800 border border-emerald-200">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
