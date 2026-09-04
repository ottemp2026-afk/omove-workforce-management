import React, { useState } from 'react';
import { Employee } from '../types';
import { StatusBadge } from './StatusBadge';
import { useAttendance } from '../context/AttendanceContext';
import { 
  Eye, 
  Edit2, 
  UserX, 
  Trash2, 
  Search, 
  Fingerprint, 
  Users,
  UserCheck,
  User,
  Building2,
  Briefcase,
  Clock,
  IndianRupee,
  Activity,
  SlidersHorizontal,
  Hash
} from 'lucide-react';
import { Modal } from './Modal';

interface EmployeeTableProps {
  onAddEmployeeClick: () => void;
  onEditEmployeeClick: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  onAddEmployeeClick,
  onEditEmployeeClick,
}) => {
  const { employees, deleteEmployee, toggleEmployeeStatus } = useAttendance();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'ALL' | 'INACTIVE'>('ACTIVE');
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const departments = Array.from(new Set(employees.map(e => e.department)));

  const filtered = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.employeeId && emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? emp.active !== false
        : emp.active === false;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const activeCount = employees.filter(e => e.active !== false).length;

  return (
    <div
      id="employee-management-table-container"
      className="rounded-md border border-slate-200 bg-white overflow-hidden"
    >
      {/* Search & Filter Header */}
      <div className="border-b border-slate-200/80 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              id="employee-table-search"
              type="text"
              placeholder="Search by name, ID or role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-800 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>

          {/* Department Filter */}
          <select
            id="employee-department-filter"
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

          {/* Status Filter (Active by default so deactivated employees disappear from list) */}
          <div className="inline-flex rounded-md border border-slate-200 bg-slate-50/50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({employees.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('INACTIVE')}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inactive ({employees.length - activeCount})
            </button>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
          {filtered.length} {filtered.length === 1 ? 'employee' : 'employees'} listed
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-slate-200 border-b-2 border-slate-800 text-[11px] font-bold uppercase tracking-wider select-none">
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  <span className="tracking-widest">EMPLOYEE ID</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="tracking-widest">NAME</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="tracking-widest">DEPARTMENT</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  <span className="tracking-widest">DESIGNATION</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Clock className="h-3.5 w-3.5 text-indigo-300" />
                  <span className="tracking-widest">SHIFT</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Fingerprint className="h-2.5 w-2.5" />
                  </span>
                  <span className="font-bold text-emerald-400 tracking-widest">FINGERPRINT ID</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="tracking-widest">OVERTIME RATE</span>
                </div>
              </th>
              <th className="px-4 py-3.5 whitespace-nowrap">
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Activity className="h-3.5 w-3.5 text-sky-400" />
                  <span className="tracking-widest">STATUS</span>
                </div>
              </th>
              <th className="px-4 py-3.5 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-1.5 text-slate-200">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                  <span className="tracking-widest">ACTIONS</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-7 w-7 text-slate-300" />
                    <p className="font-medium text-slate-700">No employees found</p>
                    <p className="text-xs text-slate-400">
                      {employees.length === 0
                        ? "Firestore employees collection is currently empty. Click 'Add Employee' to enroll the first member."
                        : "No employees match your search or filter criteria."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(emp => (
                <tr
                  key={emp.id}
                  id={`employee-row-${emp.id}`}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-2.5 font-semibold text-slate-900 font-mono">
                    {emp.employeeId || emp.id}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900">{emp.name}</div>
                    <div className="text-[10px] text-slate-400">{emp.email || 'No email registered'}</div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {emp.department}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">
                    {emp.designation}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {emp.shiftName}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    <span className="inline-flex items-center rounded-sm bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-800">
                      #{emp.fingerprintId}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    ₹{emp.overtimeRate || 80}/hr
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={emp.active ? 'Active' : 'Inactive'} size="sm" />
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => setViewingEmployee(emp)}
                        title="View Details"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEditEmployeeClick(emp)}
                        title="Edit Employee"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {/* Soft Delete / Deactivate */}
                      <button
                        type="button"
                        onClick={() => {
                          if (emp.active) {
                            if (confirm(`Deactivate employee ${emp.name} (${emp.id})? They will disappear from the active employee list.`)) {
                              deleteEmployee(emp.id, false);
                            }
                          } else {
                            toggleEmployeeStatus(emp.id);
                          }
                        }}
                        title={emp.active ? 'Deactivate (Soft Delete)' : 'Reactivate'}
                        className="rounded p-1 text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                      {/* Permanent Delete */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Permanently remove ${emp.name} (${emp.id}) from Firestore? This cannot be undone.`)) {
                            deleteEmployee(emp.id, true);
                          }
                        }}
                        title="Permanently Delete"
                        className="rounded p-1 text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 space-y-1">
            <Users className="h-6 w-6 text-slate-300 mx-auto" />
            <p className="font-medium text-slate-700 text-xs">No employees found</p>
          </div>
        ) : (
          filtered.map(emp => (
            <div key={emp.id} className="p-3.5 space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">{emp.name}</h4>
                  <p className="text-[11px] text-slate-500 font-medium font-mono">{emp.id} • {emp.department}</p>
                </div>
                <StatusBadge status={emp.active ? 'Active' : 'Inactive'} size="sm" />
              </div>

              <div className="flex items-center justify-between text-slate-600 pt-1">
                <div>
                  <span>{emp.shiftName}</span>
                  <span className="mx-1.5 text-slate-300">•</span>
                  <span className="font-medium text-slate-700">Slot #{emp.fingerprintId}</span>
                </div>
                <span className="font-semibold text-slate-800">OT: ₹{emp.overtimeRate || 80}/hr</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingEmployee(emp)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  View
                </button>
                <button
                  type="button"
                  onClick={() => onEditEmployeeClick(emp)}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (emp.active) {
                      if (confirm(`Deactivate ${emp.name}?`)) deleteEmployee(emp.id, false);
                    } else {
                      toggleEmployeeStatus(emp.id);
                    }
                  }}
                  className="rounded-md border border-amber-200 px-2.5 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                >
                  {emp.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Permanently delete ${emp.name}?`)) deleteEmployee(emp.id, true);
                  }}
                  className="rounded-md border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {viewingEmployee && (
        <Modal
          isOpen={true}
          onClose={() => setViewingEmployee(null)}
          title={`Employee File: ${viewingEmployee.name}`}
          subtitle={`${viewingEmployee.id} • Registered Biometric Profile`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Department</span>
                <p className="font-medium text-slate-900 mt-0.5 text-xs">{viewingEmployee.department}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Designation</span>
                <p className="font-medium text-slate-900 mt-0.5 text-xs">{viewingEmployee.designation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Assigned Shift</span>
                <p className="font-medium text-slate-900 mt-0.5 text-xs">{viewingEmployee.shiftName}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Fingerprint Slot</span>
                <p className="font-semibold text-slate-900 mt-0.5 text-xs">
                  #{viewingEmployee.fingerprintId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Phone</span>
                <p className="font-medium text-slate-900 mt-0.5">{viewingEmployee.phone || '—'}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Email</span>
                <p className="text-slate-900 mt-0.5">{viewingEmployee.email || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Joining Date</span>
                <p className="font-medium text-slate-900 mt-0.5">{viewingEmployee.joiningDate || '—'}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50/60 p-2.5">
                <span className="text-slate-400 font-medium uppercase text-[10px]">Overtime Rate</span>
                <p className="font-semibold text-slate-900 mt-0.5">₹{viewingEmployee.overtimeRate || 80} / hour</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200/80 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="rounded-md bg-slate-900 text-white px-3 py-1.5 text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
