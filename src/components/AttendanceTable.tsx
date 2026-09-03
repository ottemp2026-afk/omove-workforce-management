import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { Search, Calendar, Filter, Download, ArrowUpDown } from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
  subtitle?: string;
  showEmployeeName?: boolean;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  title = 'Attendance History',
  subtitle = 'Log of daily biometric scans, clocked work hours, and overtime',
  showEmployeeName = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesSearch =
        rec.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.shift.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (showEmployeeName && rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (showEmployeeName && rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMonth =
        selectedMonth === 'ALL' || rec.date.toLowerCase().includes(selectedMonth.toLowerCase());

      const matchesStatus =
        selectedStatus === 'ALL' || rec.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesMonth && matchesStatus;
    });
  }, [records, searchTerm, selectedMonth, selectedStatus, showEmployeeName]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Shift', 'IN', 'OUT', 'Hours', 'OT', 'OT Pay', 'Status'];
    const rows = filteredRecords.map(r => [
      r.date,
      r.shift,
      r.inTime,
      r.outTime || '--:--',
      r.workHours,
      r.overtimeHours,
      `₹${r.otAmount || 0}`,
      r.status,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendance_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="attendance-table-container"
      className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs"
    >
      {/* Header & Controls */}
      <div className="border-b border-slate-200/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <button
            id="attendance-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export Ledger</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder={showEmployeeName ? "Search employee, date, shift..." : "Search date, shift..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              id="attendance-month-filter"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="ALL">All Months (2026)</option>
              <option value="Sep 2026">September 2026</option>
              <option value="Aug 2026">August 2026</option>
              <option value="Jul 2026">July 2026</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              id="attendance-status-filter"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-colors cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Working">Working</option>
              <option value="Late">Late</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table: Date | Shift | IN | OUT | Hours | OT | OT Pay | Status */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {showEmployeeName && <th className="px-4 py-2.5">Employee</th>}
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Shift</th>
              <th className="px-4 py-2.5">IN</th>
              <th className="px-4 py-2.5">OUT</th>
              <th className="px-4 py-2.5">Hours</th>
              <th className="px-4 py-2.5">OT</th>
              <th className="px-4 py-2.5">OT Pay</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredRecords.length > 0 ? (
              filteredRecords.map(record => (
                <tr
                  key={record.id}
                  id={`attendance-row-${record.id}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {showEmployeeName && (
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-900">{record.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{record.employeeId}</div>
                    </td>
                  )}
                  <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {record.shift}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">
                    {record.inTime}
                  </td>
                  <td className="px-4 py-2.5 text-slate-900">
                    {record.outTime || '--:--'}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    {record.workHours}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 font-medium">
                    {record.overtimeHours}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-slate-900">
                    ₹{Number(record.otAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={record.status} size="sm" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={showEmployeeName ? 9 : 8}
                  className="px-4 py-8 text-center text-xs text-slate-500"
                >
                  No attendance records found matching filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="divide-y divide-slate-100 md:hidden">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <div key={record.id} className="p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-900">{record.date}</span>
                  <span className="ml-2 text-slate-500 text-[11px]">{record.shift}</span>
                </div>
                <StatusBadge status={record.status} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100">
                <div>
                  <span className="text-slate-400">IN / OUT: </span>
                  <span className="font-medium text-slate-800">{record.inTime} – {record.outTime || '--:--'}</span>
                </div>
                <div>
                  <span className="text-slate-400">Hours: </span>
                  <span className="font-semibold text-slate-900">{record.workHours}</span>
                </div>
                <div>
                  <span className="text-slate-400">OT: </span>
                  <span className="font-medium text-slate-800">{record.overtimeHours}</span>
                </div>
                <div>
                  <span className="text-slate-400">OT Pay: </span>
                  <span className="font-semibold text-slate-900">₹{Number(record.otAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-500">
            No attendance records found
          </div>
        )}
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/50 px-4 py-2 text-xs text-slate-500">
        <span>Showing {filteredRecords.length} of {records.length} records</span>
        <span className="text-[11px] text-slate-400">ESP32 DS3231 Ledger</span>
      </div>
    </div>
  );
};
