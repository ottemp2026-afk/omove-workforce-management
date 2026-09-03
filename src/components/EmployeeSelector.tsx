import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Building2, Clock, ChevronDown } from 'lucide-react';

export const EmployeeSelector: React.FC = () => {
  const { employees, selectedEmployee, setSelectedEmployeeId } = useAttendance();

  if (!selectedEmployee || employees.length === 0) {
    return null;
  }

  return (
    <div
      id="employee-selector-card"
      className="rounded-xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Active Employee Details */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-xs">
            {selectedEmployee.avatarInitials || 'EM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                {selectedEmployee.name}
              </h2>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[11px] font-semibold text-slate-700 font-mono">
                {selectedEmployee.employeeId || selectedEmployee.id}
              </span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3 text-slate-400" />
                {selectedEmployee.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {selectedEmployee.shiftName}
              </span>
              <span>•</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 text-[10px] font-medium">
                Fingerprint #{selectedEmployee.fingerprintId}
              </span>
            </div>
          </div>
        </div>

        {/* Switch Employee Dropdown */}
        {employees.length > 1 && (
          <div className="flex items-center gap-2 self-start sm:self-center">
            <label htmlFor="employee-quick-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Switch Employee:
            </label>
            <div className="relative">
              <select
                id="employee-quick-select"
                value={selectedEmployee.id}
                onChange={e => setSelectedEmployeeId(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-2.5 pr-7 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 focus:border-slate-900 focus:outline-hidden cursor-pointer"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId || emp.id} - {emp.department})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
