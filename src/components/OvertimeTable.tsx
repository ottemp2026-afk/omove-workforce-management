import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { 
  Search, 
  Download, 
  Clock, 
  DollarSign, 
  Calendar, 
  Users, 
  Filter,
  User,
  Briefcase,
  LogIn,
  LogOut,
  Zap,
  IndianRupee,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface OvertimeTableProps {
  records: AttendanceRecord[];
}

type OtSortField = 'employee' | 'date' | 'shift' | 'in' | 'out' | 'hours' | 'otHours' | 'otRate' | 'otAmount';

export const OvertimeTable: React.FC<OvertimeTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [empFilter, setEmpFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [sortField, setSortField] = useState<OtSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: OtSortField) => {
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

  // Distinct values for filter dropdowns
  const departments = useMemo(() => Array.from(new Set(records.map(r => r.department).filter(Boolean))), [records]);
  const shifts = useMemo(() => Array.from(new Set(records.map(r => r.shift).filter(Boolean))), [records]);
  const employees = useMemo(() => {
    const map = new Map<string, string>();
    records.forEach(r => {
      if (r.employeeId && r.employeeName) {
        map.set(r.employeeId, r.employeeName);
      }
    });
    return Array.from(map.entries());
  }, [records]);
  const dates = useMemo(() => Array.from(new Set(records.map(r => r.date).filter(Boolean))), [records]);

  // Filter records that have overtime (>0 otHours or >0 otAmount)
  const filteredOvertimeRecords = useMemo(() => {
    return records
      .filter(r => {
        const otVal = typeof r.overtimeHours === 'number' ? r.overtimeHours : (parseInt(String(r.overtimeHours || '0'), 10) || 0);
        const otAmt = r.overtimeAmount || r.otAmount || 0;
        return otVal > 0 || otAmt > 0;
      })
      .filter(rec => {
        const matchesSearch =
          rec.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.date.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDept = deptFilter === 'ALL' || rec.department === deptFilter;
        const matchesShift = shiftFilter === 'ALL' || rec.shift === shiftFilter;
        const matchesEmp = empFilter === 'ALL' || rec.employeeId === empFilter;
        const matchesDate = dateFilter === 'ALL' || rec.date === dateFilter;

        return matchesSearch && matchesDept && matchesShift && matchesEmp && matchesDate;
      });
  }, [records, searchTerm, deptFilter, shiftFilter, empFilter, dateFilter]);

  const overtimeRecords = useMemo(() => {
    if (!sortField) return filteredOvertimeRecords;
    return [...filteredOvertimeRecords].sort((a, b) => {
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
        case 'otHours':
          valA = typeof a.overtimeHours === 'number' ? a.overtimeHours : parseInt(String(a.overtimeHours || 0), 10);
          valB = typeof b.overtimeHours === 'number' ? b.overtimeHours : parseInt(String(b.overtimeHours || 0), 10);
          break;
        case 'otRate':
          valA = a.overtimeRate || a.otRate || 80;
          valB = b.overtimeRate || b.otRate || 80;
          break;
        case 'otAmount':
          valA = a.overtimeAmount || a.otAmount || 0;
          valB = b.overtimeAmount || b.otAmount || 0;
          break;
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredOvertimeRecords, sortField, sortDirection]);

  // Totals calculated strictly from real attendance data
  const totalOvertimeAmount = overtimeRecords.reduce((sum, r) => sum + (r.overtimeAmount || r.otAmount || 0), 0);
  const totalOvertimeHours = overtimeRecords.reduce((sum, r) => {
    if (typeof r.overtimeHours === 'number') return sum + r.overtimeHours;
    const match = String(r.overtimeHours || '').match(/(\d+)h/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  const handleExportCSV = () => {
    const headers = ['Employee', 'Employee ID', 'Date', 'Shift', 'IN', 'OUT', 'Worked Hours', 'Regular Hours', 'OT Hours', 'OT Rate (₹)', 'OT Amount (₹)'];
    const rows = overtimeRecords.map(r => [
      `"${r.employeeName}"`,
      r.employeeId,
      r.date,
      r.shift,
      r.inTime,
      r.outTime || '--:--',
      r.workHours,
      r.regularHours,
      typeof r.overtimeHours === 'number' ? `${r.overtimeHours}h 00m` : r.overtimeHours,
      r.overtimeRate || r.otRate || 80,
      r.overtimeAmount || r.otAmount || 0,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `overtime_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      id="overtime-table-container"
      className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-xs"
    >
      {/* Filters Toolbar */}
      <div className="border-b border-slate-200/80 p-4 space-y-3 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Overtime Ledger</h3>
              <p className="text-xs text-slate-500 font-medium">
                {overtimeRecords.length} qualifying entries • Total Payout: <span className="font-bold text-slate-900">₹{totalOvertimeAmount.toFixed(0)}</span>
              </p>
            </div>
          </div>

          <button
            id="overtime-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all self-start sm:self-auto shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export OT Report</span>
          </button>
        </div>

        {/* 5 Filter Controls */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="overtime-search-input"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>

          {/* Employee Filter */}
          <select
            id="overtime-emp-filter"
            value={empFilter}
            onChange={e => setEmpFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Employees</option>
            {employees.map(([id, name]) => (
              <option key={id} value={id}>
                {name} ({id})
              </option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            id="overtime-dept-filter"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            id="overtime-shift-filter"
            value={shiftFilter}
            onChange={e => setShiftFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Shifts</option>
            {shifts.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            id="overtime-date-filter"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white py-2 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-all shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Dates</option>
            {dates.map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table: Employee | Date | Worked Hours | OT Hours | OT Rate | OT Amount */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-slate-200 border-b-2 border-slate-800 text-[11px] font-bold uppercase tracking-wider select-none">
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
                title="Click to sort by Worked Hours"
              >
                <div className="flex items-center gap-2 text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-indigo-300 group-hover:text-white transition-colors" />
                  <span className="tracking-widest">WORKED HOURS</span>
                  {sortField === 'hours' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-indigo-400" /> : <ArrowDown className="h-3 w-3 text-indigo-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('otHours')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by OT Hours"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
                    <Zap className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-amber-400 tracking-widest">OT HOURS</span>
                  {sortField === 'otHours' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-amber-400" /> : <ArrowDown className="h-3 w-3 text-amber-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('otRate')}
                className="px-4 py-3.5 cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Rate"
              >
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-slate-300">
                    <IndianRupee className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-slate-200 tracking-widest">OT RATE</span>
                  {sortField === 'otRate' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-slate-100" /> : <ArrowDown className="h-3 w-3 text-slate-100" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
              <th 
                onClick={() => handleSort('otAmount')}
                className="px-4 py-3.5 text-right cursor-pointer hover:bg-slate-800/80 transition-colors whitespace-nowrap group"
                title="Click to sort by Payout Amount"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <IndianRupee className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-emerald-400 tracking-widest">OT AMOUNT</span>
                  {sortField === 'otAmount' ? (
                    sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 text-emerald-400" /> : <ArrowDown className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <ArrowUpDown className="h-2.5 w-2.5 text-slate-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {overtimeRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Clock className="h-6 w-6 text-slate-300" />
                    <p className="font-medium text-slate-700">No overtime entries found</p>
                    <p className="text-xs text-slate-400">
                      Overtime is registered when shift duration exceeds 8 completed hours (480 minutes).
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              overtimeRecords.map((record, idx) => {
                const otHoursStr = typeof record.overtimeHours === 'number'
                  ? `${String(record.overtimeHours).padStart(2, '0')}h 00m`
                  : record.overtimeHours;
                const otAmt = record.overtimeAmount || record.otAmount || 0;
                const otRate = record.overtimeRate || record.otRate || 80;

                return (
                  <tr
                    key={record.id}
                    id={`overtime-row-${record.id}`}
                    className={`hover:bg-slate-100/70 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{record.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.employeeId} • {record.department}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {record.shift}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-bold font-mono">
                      {record.inTime}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-mono">
                      {record.outTime || '--:--'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200">
                        {record.workHours}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 border border-amber-200 text-xs">
                        {otHoursStr}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      ₹{otRate}/hr
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                        ₹{otAmt.toFixed(0)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {overtimeRecords.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50/80 border-t border-slate-200 font-semibold text-xs text-slate-900">
                <td colSpan={6} className="px-4 py-2.5 text-slate-600">
                  Total Qualifying Overtime ({overtimeRecords.length} records)
                </td>
                <td className="px-4 py-2.5 text-amber-800">
                  {totalOvertimeHours} hrs (complete blocks)
                </td>
                <td className="px-4 py-2.5 text-slate-500">
                  Avg ₹80/hr
                </td>
                <td className="px-4 py-2.5 text-right text-slate-900 text-sm">
                  ₹{totalOvertimeAmount.toFixed(0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {overtimeRecords.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No overtime records found matching criteria.
          </div>
        ) : (
          overtimeRecords.map(record => {
            const otHoursStr = typeof record.overtimeHours === 'number'
              ? `${String(record.overtimeHours).padStart(2, '0')}h 00m`
              : record.overtimeHours;
            const otAmt = record.overtimeAmount || record.otAmount || 0;
            const otRate = record.overtimeRate || record.otRate || 80;

            return (
              <div key={record.id} className="p-3.5 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{record.employeeName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{record.employeeId} • {record.date}</p>
                  </div>
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                    {otHoursStr}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-1">
                  <span>Worked: {record.workHours}</span>
                  <span className="font-bold text-slate-900 text-sm">₹{otAmt.toFixed(0)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
