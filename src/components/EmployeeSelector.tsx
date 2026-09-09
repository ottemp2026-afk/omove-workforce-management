import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Building2, 
  Clock, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Fingerprint, 
  UserCheck, 
  Shield, 
  Search, 
  Users,
  CheckCircle2
} from 'lucide-react';

export const EmployeeSelector: React.FC = () => {
  const { employees, selectedEmployee, setSelectedEmployeeId } = useAttendance();
  const [filterQuery, setFilterQuery] = useState('');

  // Find index of currently selected employee for Prev/Next cycling
  const currentIndex = useMemo(() => {
    if (!selectedEmployee) return 0;
    return employees.findIndex(e => e.id === selectedEmployee.id);
  }, [employees, selectedEmployee]);

  const handlePrev = () => {
    if (employees.length === 0) return;
    const prevIdx = (currentIndex - 1 + employees.length) % employees.length;
    setSelectedEmployeeId(employees[prevIdx].id);
  };

  const handleNext = () => {
    if (employees.length === 0) return;
    const nextIdx = (currentIndex + 1) % employees.length;
    setSelectedEmployeeId(employees[nextIdx].id);
  };

  // Filtered employees for the quick-switch pill carousel
  const filteredEmployees = useMemo(() => {
    if (!filterQuery.trim()) return employees;
    const q = filterQuery.toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(q) ||
      (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
      e.department.toLowerCase().includes(q) ||
      String(e.fingerprintId).includes(q)
    );
  }, [employees, filterQuery]);

  if (!selectedEmployee || employees.length === 0) {
    return null;
  }

  // Helper for department-based avatar colors
  const getAvatarBadge = (dept: string, isSelected: boolean) => {
    if (isSelected) return 'bg-slate-950 text-emerald-400 ring-2 ring-emerald-300';
    const d = dept.toLowerCase();
    if (d.includes('eng')) return 'bg-blue-600/90 text-white';
    if (d.includes('prod')) return 'bg-emerald-600/90 text-white';
    if (d.includes('assem')) return 'bg-purple-600/90 text-white';
    if (d.includes('qual')) return 'bg-amber-600/90 text-white';
    return 'bg-slate-700 text-white';
  };

  return (
    <div
      id="employee-selector-card"
      className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl p-5 sm:p-6 space-y-4"
    >
      {/* Top Ambient Glow */}
      <div className="pointer-events-none absolute -top-12 right-1/4 h-36 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

      {/* Row 1: Selected Staff Overview + Rapid Flip Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        {/* Active Employee Details */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 text-slate-950 font-black text-lg shadow-lg ring-2 ring-emerald-400/40">
              {selectedEmployee.avatarInitials || selectedEmployee.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950" title="Active Staff">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700">
                ACTIVE PROFILE
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                {selectedEmployee.name}
              </h2>
              <span className="rounded-md bg-cyan-950/80 px-2 py-0.5 text-xs font-bold text-cyan-300 font-mono border border-cyan-500/40">
                {selectedEmployee.employeeId || selectedEmployee.id}
              </span>
              <span className="rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-400 border border-emerald-500/50 inline-flex items-center gap-1 shadow-xs">
                <UserCheck className="h-3 w-3" />
                Verified Personnel
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono">
              <span className="flex items-center gap-1 text-slate-200">
                <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-sans font-medium">{selectedEmployee.department}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-200">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-sans font-medium">{selectedEmployee.shiftName}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-600/50 text-[11px] font-bold">
                <Fingerprint className="h-3 w-3 text-emerald-400" />
                <span>Sensor Slot #{selectedEmployee.fingerprintId}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Rapid Cycling Controls: Prev / Next Buttons */}
        {employees.length > 1 && (
          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              id="switch-prev-employee-btn"
              onClick={handlePrev}
              title="Previous Employee"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-cyan-400" />
              <span>Prev</span>
            </button>

            <span className="text-xs font-mono text-slate-400 px-1 font-bold">
              {currentIndex + 1} / {employees.length}
            </span>

            <button
              type="button"
              id="switch-next-employee-btn"
              onClick={handleNext}
              title="Next Employee"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            </button>
          </div>
        )}
      </div>

      {/* Row 2: 1-Click Interactive Employee Switcher Strip */}
      {employees.length > 1 && (
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                1-CLICK SWITCH PROFILE ({employees.length} EMPLOYEES)
              </span>
            </div>

            {/* Quick Filter Input */}
            {employees.length > 4 && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Quick filter by name or ID..."
                  value={filterQuery}
                  onChange={e => setFilterQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-8 pr-3 py-1 text-xs text-white placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Interactive Profile Pills Bar (One Click to Switch!) */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {filteredEmployees.map((emp) => {
              const isSelected = emp.id === selectedEmployee.id;
              return (
                <button
                  key={emp.id}
                  id={`quick-select-emp-${emp.id}`}
                  type="button"
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className={`group relative flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2 transition-all duration-200 cursor-pointer active:scale-95 text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-300'
                      : 'bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-slate-500 shadow-sm'
                  }`}
                >
                  {/* Mini Avatar */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold shadow-xs transition-transform group-hover:scale-105 ${getAvatarBadge(
                      emp.department,
                      isSelected
                    )}`}
                  >
                    {emp.avatarInitials || emp.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Name & Details */}
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate max-w-[130px]">
                        {emp.name}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-slate-950 shrink-0" />
                      )}
                    </div>
                    <div
                      className={`text-[10px] font-mono truncate ${
                        isSelected ? 'text-slate-900/80 font-semibold' : 'text-slate-400'
                      }`}
                    >
                      {emp.employeeId || emp.id} • {emp.department}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
