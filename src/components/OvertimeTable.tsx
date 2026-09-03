import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { Search, Download, Clock, DollarSign, Calendar, Users, Filter } from 'lucide-react';

interface OvertimeTableProps {
  records: AttendanceRecord[];
}

export const OvertimeTable: React.FC<OvertimeTableProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [empFilter, setEmpFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

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
  const overtimeRecords = useMemo(() => {
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
      className="rounded-md border border-slate-200 bg-white overflow-hidden"
    >
      {/* Filters Toolbar - Employee, Date, Department, Shift (Section 20) */}
      <div className="border-b border-slate-200/80 p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Overtime Ledger</h3>
            <span className="text-xs text-slate-500 font-medium">
              ({overtimeRecords.length} qualifying entries • Total: ₹{totalOvertimeAmount.toFixed(0)})
            </span>
          </div>

          <button
            id="overtime-export-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export OT Report</span>
          </button>
        </div>

        {/* 5 Filter Controls */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="overtime-search-input"
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Employee Filter */}
          <select
            id="overtime-emp-filter"
            value={empFilter}
            onChange={e => setEmpFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
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
            className="rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
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
            className="rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
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
            className="rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-700 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
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
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-medium uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2.5">Employee</th>
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Shift</th>
              <th className="px-4 py-2.5">IN</th>
              <th className="px-4 py-2.5">OUT</th>
              <th className="px-4 py-2.5">Worked Hours</th>
              <th className="px-4 py-2.5">OT Hours</th>
              <th className="px-4 py-2.5">OT Rate</th>
              <th className="px-4 py-2.5 text-right">OT Amount</th>
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
              overtimeRecords.map(record => {
                const otHoursStr = typeof record.overtimeHours === 'number'
                  ? `${String(record.overtimeHours).padStart(2, '0')}h 00m`
                  : record.overtimeHours;
                const otAmt = record.overtimeAmount || record.otAmount || 0;
                const otRate = record.overtimeRate || record.otRate || 80;

                return (
                  <tr
                    key={record.id}
                    id={`overtime-row-${record.id}`}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-900">{record.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{record.employeeId} • {record.department}</div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">
                      {record.date}
                    </td>
                    <td className="px-4 py-2.5 text-slate-700">
                      {record.shift}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 font-medium">
                      {record.inTime}
                    </td>
                    <td className="px-4 py-2.5 text-slate-800 font-medium">
                      {record.outTime || '--:--'}
                    </td>
                    <td className="px-4 py-2.5 font-semibold text-slate-900">
                      {record.workHours}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-800 border border-amber-200 text-xs">
                        {otHoursStr}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-700 font-medium">
                      ₹{otRate}/hr
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                      ₹{otAmt.toFixed(0)}
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
