import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { EmployeeTable } from '../../components/EmployeeTable';
import { AddEmployeeModal } from '../../components/AddEmployeeModal';
import { Employee } from '../../types';
import { UserPlus, Users, Fingerprint, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Workforce Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage personnel profiles, shift schedules, and R307S fingerprint sensor slot bindings
          </p>
        </div>

        <button
          id="btn-add-employee-trigger"
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors self-start sm:self-auto"
        >
          <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Add Employee</span>
        </button>
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
