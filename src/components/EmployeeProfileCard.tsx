import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from './StatusBadge';
import { 
  User, 
  Building2, 
  Briefcase, 
  Clock, 
  Fingerprint, 
  IndianRupee, 
  Calendar, 
  ShieldCheck,
  Hash,
  Award
} from 'lucide-react';

export const EmployeeProfileCard: React.FC = () => {
  const { selectedEmployee } = useAttendance();

  if (!selectedEmployee) {
    return null;
  }

  let formattedJoiningDate = selectedEmployee.joiningDate || '03/09/2026';
  try {
    const d = new Date(selectedEmployee.joiningDate);
    if (!isNaN(d.getTime())) {
      formattedJoiningDate = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  } catch {
    // Keep original string if date parsing fails
  }

  return (
    <div
      id="employee-profile-section"
      className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all hover:shadow-sm relative overflow-hidden"
    >
      {/* Decorative biometric watermark */}
      <div className="pointer-events-none absolute -right-6 -bottom-6 opacity-[0.03] text-slate-900 select-none">
        <Fingerprint className="h-44 w-44" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shadow-xs">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Employee Personnel Credential</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified workforce record and hardware biometric mapping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusBadge status={selectedEmployee.active ? 'Active' : 'Inactive'} size="sm" />
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 font-mono">
            R307S Slot #{selectedEmployee.fingerprintId}
          </span>
        </div>
      </div>

      {/* Modern Grid of 8 Credential Attribute Cards with Unique Themes */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* 1. Employee ID */}
        <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-blue-800 text-[10.5px] font-extrabold uppercase tracking-wider">Employee ID</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500 text-white shadow-2xs">
              <Hash className="h-3 w-3" />
            </div>
          </div>
          <p className="font-mono text-base font-bold text-slate-900 tracking-tight">
            {selectedEmployee.employeeId || selectedEmployee.id}
          </p>
          <span className="text-[10.5px] text-blue-700 mt-1 block font-medium">Firestore UID</span>
        </div>

        {/* 2. Full Name */}
        <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-indigo-800 text-[10.5px] font-extrabold uppercase tracking-wider">Full Name</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 text-white shadow-2xs">
              <User className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 tracking-tight truncate">
            {selectedEmployee.name}
          </p>
          <span className="text-[10.5px] text-indigo-700 mt-1 block font-medium">Registered Staff</span>
        </div>

        {/* 3. Department */}
        <div className="rounded-2xl border border-cyan-200/80 bg-gradient-to-br from-cyan-50/80 via-white to-teal-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-cyan-800 text-[10.5px] font-extrabold uppercase tracking-wider">Department</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-600 text-white shadow-2xs">
              <Building2 className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">
            {selectedEmployee.department}
          </p>
          <span className="text-[10.5px] text-cyan-700 mt-1 block font-medium">Operational Unit</span>
        </div>

        {/* 4. Designation */}
        <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/80 via-white to-pink-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-purple-800 text-[10.5px] font-extrabold uppercase tracking-wider">Designation</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500 text-white shadow-2xs">
              <Briefcase className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">
            {selectedEmployee.designation}
          </p>
          <span className="text-[10.5px] text-purple-700 mt-1 block font-medium">Assigned Role</span>
        </div>

        {/* 5. Assigned Shift */}
        <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 via-white to-blue-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sky-800 text-[10.5px] font-extrabold uppercase tracking-wider">Shift Timing</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500 text-white shadow-2xs">
              <Clock className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900 truncate">
            {selectedEmployee.shiftName}
          </p>
          <span className="text-[10.5px] text-sky-700 mt-1 block font-medium">8-Hour Shift Window</span>
        </div>

        {/* 6. Biometric Fingerprint Slot */}
        <div className="rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-emerald-800 text-[10.5px] font-extrabold uppercase tracking-wider">Sensor Template</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
              <Fingerprint className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-800 font-mono tracking-tight">
            Slot #{selectedEmployee.fingerprintId}
          </p>
          <span className="text-[10.5px] text-emerald-700 mt-1 block font-medium">ESP32 R307S Enrolled</span>
        </div>

        {/* 7. Overtime Compensation */}
        <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-800 text-[10.5px] font-extrabold uppercase tracking-wider">Overtime Multiplier</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-white shadow-2xs">
              <IndianRupee className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-amber-900 font-mono tracking-tight">
            ₹{selectedEmployee.overtimeRate || 80} / hr
          </p>
          <span className="text-[10.5px] text-amber-700 mt-1 block font-medium">Strict 1-Hour Blocks</span>
        </div>

        {/* 8. Joining Date */}
        <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 via-white to-pink-50/30 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-rose-800 text-[10.5px] font-extrabold uppercase tracking-wider">Joining Date</span>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-500 text-white shadow-2xs">
              <Calendar className="h-3 w-3" />
            </div>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formattedJoiningDate}
          </p>
          <span className="text-[10.5px] text-rose-700 mt-1 block font-medium">Official Enrollment</span>
        </div>
      </div>
    </div>
  );
};
