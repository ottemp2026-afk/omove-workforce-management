import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { StatusBadge } from './StatusBadge';
import { 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  User,
  Briefcase,
  LogIn,
  LogOut,
  Clock,
  Zap,
  IndianRupee,
  Activity
} from 'lucide-react';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  title?: string;
  subtitle?: string;
  showEmployeeName?: boolean;
}

type SortField = 'employee' | 'date' | 'shift' | 'in' | 'out' | 'hours' | 'ot' | 'otPay' | 'status';

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  title = 'Attendance History',
  subtitle = 'Log of daily biometric scans, clocked work hours, and overtime',
  showEmployeeName = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  // Sort filtered records
  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      switch (sortField) {
        case 'employee':
          valA = a.employeeName || '';
          valB = b.employeeName || '';
          break;
        case 'date':
          valA = a.date || '';
          valB = b.date || '';
          break;
        case 'shift':
          valA = a.shift || '';
          valB = b.shift || '';
          break;
        case 'in':
          valA = a.inTime || '';
          valB = b.inTime || '';
          break;
        case 'out':
          valA = a.outTime || '';
          valB = b.outTime || '';
          break;
        case 'hours':
          valA = a.workHours || '';
          valB = b.workHours || '';
          break;
        case 'ot':
          valA = typeof a.overtimeHours === 'number' ? a.overtimeHours : parseInt(String(a.overtimeHours || 0), 10);
          valB = typeof b.overtimeHours === 'number' ? b.overtimeHours : parseInt(String(b.overtimeHours || 0), 10);
          break;
        case 'otPay':
          valA = a.otAmount || a.overtimeAmount || 0;
          valB = b.otAmount || b.overtimeAmount || 0;
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Shift', 'IN', 'OUT', 'Hours', 'OT', 'OT Pay', 'Status'];
    const rows = sortedRecords.map(r => [
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
      className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs"
    >
      {/* Header & Controls */}
      <div className="border-b border-slate-200/80 p-4 space-y-3 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <button
            id="attendance-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Ledger</span>
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder={showEmployeeName ? "Search employee, date, shift..." : "Search date, shift..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              id="attendance-month-filter"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
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
              className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
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
            <tr className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-slate-200 border-b-2 border-slate-800 text-[11px] font-bold uppercase tracking-wider select-none">
              {showEmployeeName && (
                <th 
                  onClick={() => handleSort('employee')}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                  title="Click to sort by Employee"
                >
                  <div className="flex items-center gap-2 text-slate-200">
                    <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                    <span className="tracking-widest">EMPLOYEE</span>
                    {sortField === 'employee' ? (
                      sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </th>
              )}
              <th 
                onClick={() => handleSort('date')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Date"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">DATE</span>
                  {sortField === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('shift')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Shift"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">SHIFT</span>
                  {sortField === 'shift' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('in')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Punch IN"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <LogIn className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-emerald-400 tracking-widest">IN</span>
                  {sortField === 'in' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('out')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Punch OUT"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                    <LogOut className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-rose-400 tracking-widest">OUT</span>
                  {sortField === 'out' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-rose-400" /> : <ArrowDown className="h-3 w-3 text-rose-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('hours')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Duration"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-indigo-300 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">HOURS</span>
                  {sortField === 'hours' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-400" /> : <ArrowDown className="h-3 w-3 text-indigo-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('ot')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Overtime"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <Zap className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-amber-400 tracking-widest">OT</span>
                  {sortField === 'ot' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('otPay')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by OT Pay"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <IndianRupee className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-emerald-400 tracking-widest">OT PAY</span>
                  {sortField === 'otPay' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('status')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Status"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Activity className="h-3.5 w-3.5 text-sky-400 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">STATUS</span>
                  {sortField === 'status' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-sky-400" /> : <ArrowDown className="h-3 w-3 text-sky-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record, idx) => (
                <tr
                  key={record.id}
                  id={`attendance-row-${record.id}`}
                  className={`hover:bg-slate-100/70 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  {showEmployeeName && (
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{record.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.employeeId}</div>
                    </td>
                  )}
                  <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                    {record.date}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {record.shift}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900 font-mono">
                    {record.inTime}
                  </td>
                  <td className="px-4 py-3 text-slate-900 font-mono">
                    {record.outTime || '--:--'}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                      {record.workHours}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {record.overtimeHours && record.overtimeHours !== '0h 00m' && record.overtimeHours !== 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">
                        {record.overtimeHours}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">--</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {record.otAmount && record.otAmount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                        ₹{Number(record.otAmount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-mono">₹0.00</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
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
            <div key={record.id} className="p-3.5 space-y-2 text-xs bg-white hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{record.date}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">{record.shift}</span>
                  </div>
                  {showEmployeeName && (
                    <div className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                      {record.employeeName} ({record.employeeId})
                    </div>
                  )}
                </div>
                <StatusBadge status={record.status} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5 border-t border-slate-100 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">IN/OUT:</span>
                  <span className="font-bold text-slate-800">{record.inTime} – {record.outTime || '--:--'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">Hours:</span>
                  <span className="font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{record.workHours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">OT:</span>
                  <span className={`font-semibold ${record.overtimeHours && record.overtimeHours !== '0h 00m' && record.overtimeHours !== 0 ? 'text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-slate-500'}`}>
                    {record.overtimeHours || '--'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-sans">OT Pay:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    ₹{Number(record.otAmount || 0).toFixed(0)}
                  </span>
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
