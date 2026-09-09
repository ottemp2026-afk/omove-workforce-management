import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { EmployeeTable } from '../../components/EmployeeTable';
import { AddEmployeeModal } from '../../components/AddEmployeeModal';
import { StatCard } from '../../components/StatCard';
import { Employee } from '../../types';
import { UserPlus, Users, Fingerprint, ShieldCheck, UserCheck, UserX } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { employees } = useAttendance();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const handleOpenAdd = () => {
    setEmployeeToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsAddModalOpen(true);
  };

  const totalStaff = employees.length;
  const activeStaff = employees.filter(e => e.active !== false).length;
  const inactiveStaff = employees.filter(e => e.active === false).length;
  const enrolledSlots = employees.filter(e => e.fingerprintId !== undefined && e.fingerprintId > 0).length;

  return (
    <div className="space-y-7 pb-14">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Workforce Directory
            </h1>
            <span className="rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-2.5 py-0.5 text-xs font-mono font-bold">
              {totalStaff} Personnel
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage employee personnel profiles, shift bindings, and R307S biometric sensor template allocations
          </p>
        </div>

        <button
          id="btn-add-employee-trigger"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 transition-all shadow-md shadow-emerald-500/25 active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4 text-slate-950" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Directory Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          id="stat-dir-total"
          title="TOTAL STAFF"
          value={totalStaff}
          subtitle="Enrolled in Firestore Database"
          icon={Users}
          accentColor="blue"
          badge="DIRECTORY"
        />
        <StatCard
          id="stat-dir-active"
          title="ACTIVE PERSONNEL"
          value={activeStaff}
          subtitle="Credentials in active status"
          icon={UserCheck}
          highlight={true}
          accentColor="emerald"
          badge="ENABLED"
        />
        <StatCard
          id="stat-dir-inactive"
          title="DEACTIVATED"
          value={inactiveStaff}
          subtitle="Soft-deleted or suspended"
          icon={UserX}
          accentColor="amber"
          badge="SUSPENDED"
        />
        <StatCard
          id="stat-dir-slots"
          title="BIOMETRIC SLOTS"
          value={`${enrolledSlots} / 1000`}
          subtitle="R307S optical templates bound"
          icon={Fingerprint}
          accentColor="cyan"
          badge="HARDWARE"
        />
      </div>

      {/* Main Employee Table */}
      <EmployeeTable
        onAddEmployeeClick={handleOpenAdd}
        onEditEmployeeClick={handleOpenEdit}
      />

      {/* Modal for Add / Edit */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        employeeToEdit={employeeToEdit}
      />
    </div>
  );
};
