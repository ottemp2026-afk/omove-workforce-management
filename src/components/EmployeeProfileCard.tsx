import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StatusBadge } from './StatusBadge';

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
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs"
    >
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Employee Profile
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personnel record and biometric identification details from Firestore
          </p>
        </div>
        <StatusBadge status={selectedEmployee.active ? 'Active' : 'Inactive'} size="sm" />
      </div>

      {/* Two-Column Layout */}
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5 text-xs">
        <div>
          <dt className="text-slate-500 font-medium">Employee ID</dt>
          <dd className="mt-0.5 font-semibold text-slate-900 text-sm font-mono">
            {selectedEmployee.employeeId || selectedEmployee.id}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Name</dt>
          <dd className="mt-0.5 font-medium text-slate-900 text-sm">
            {selectedEmployee.name}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Department</dt>
          <dd className="mt-0.5 text-slate-900 text-sm">
            {selectedEmployee.department}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Designation</dt>
          <dd className="mt-0.5 text-slate-900 text-sm">
            {selectedEmployee.designation}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Shift</dt>
          <dd className="mt-0.5 text-slate-900 text-sm">
            {selectedEmployee.shiftName}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Fingerprint ID</dt>
          <dd className="mt-0.5 font-medium text-slate-900 text-sm">
            #{selectedEmployee.fingerprintId}
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Overtime Rate</dt>
          <dd className="mt-0.5 text-slate-900 text-sm font-semibold">
            ₹{selectedEmployee.overtimeRate || 80} / completed hour
          </dd>
        </div>

        <div>
          <dt className="text-slate-500 font-medium">Joining Date</dt>
          <dd className="mt-0.5 text-slate-900 text-sm">
            {formattedJoiningDate}
          </dd>
        </div>
      </dl>
    </div>
  );
};
