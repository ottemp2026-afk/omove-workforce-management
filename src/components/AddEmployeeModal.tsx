import React, { useState, useEffect } from 'react';
import { Employee, Shift } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { Modal } from './Modal';
import { Fingerprint, User, Phone, Mail, Building2, Briefcase, Calendar, Clock, DollarSign, Hash } from 'lucide-react';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
}) => {
  const { addEmployee, updateEmployee, shifts, employees } = useAttendance();

  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Production');
  const [designation, setDesignation] = useState('Operator');
  const [joiningDate, setJoiningDate] = useState('03/09/2026');
  const [shiftId, setShiftId] = useState('SHIFT-A');
  const [fingerprintId, setFingerprintId] = useState<number>(1);
  const [overtimeRate, setOvertimeRate] = useState<number>(80);
  const [active, setActive] = useState<boolean>(true);

  useEffect(() => {
    if (employeeToEdit) {
      setEmployeeId(employeeToEdit.employeeId || employeeToEdit.id);
      setName(employeeToEdit.name);
      setPhone(employeeToEdit.phone || '');
      setEmail(employeeToEdit.email || '');
      setDepartment(employeeToEdit.department || 'Production');
      setDesignation(employeeToEdit.designation || 'Operator');
      setJoiningDate(employeeToEdit.joiningDate || '03/09/2026');
      setShiftId(employeeToEdit.shiftId || 'SHIFT-A');
      setFingerprintId(Number(employeeToEdit.fingerprintId || 1));
      setOvertimeRate(Number(employeeToEdit.overtimeRate || 80));
      setActive(employeeToEdit.active !== false);
    } else {
      // Suggest next sequential employee ID & next available fingerprint slot
      const maxEmpNum = employees.reduce((max, e) => {
        const match = e.id.match(/EMP(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextId = `EMP${String(maxEmpNum + 1).padStart(3, '0')}`;

      const maxFp = employees.reduce((max, e) => (Number(e.fingerprintId) > max ? Number(e.fingerprintId) : max), 0);

      setEmployeeId(nextId);
      setName('');
      setPhone('+91 ');
      setEmail('');
      setDepartment('Production');
      setDesignation('Operator');
      setJoiningDate('03/09/2026');
      setShiftId('SHIFT-A');
      setFingerprintId(maxFp + 1);
      setOvertimeRate(80);
      setActive(true);
    }
  }, [employeeToEdit, isOpen, employees]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const selectedShift = shifts.find(s => s.id === shiftId || s.shiftId === shiftId);
    const shiftName = selectedShift ? selectedShift.name : 'Shift A';

    if (employeeToEdit) {
      updateEmployee(employeeToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        department,
        designation: designation.trim() || 'Operator',
        joiningDate: joiningDate.trim(),
        shiftId,
        shiftName,
        fingerprintId: Number(fingerprintId),
        overtimeRate: Number(overtimeRate || 80),
        active,
        status: active ? 'Active' : 'Inactive',
      });
    } else {
      addEmployee({
        employeeId: employeeId.trim() || undefined,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@omove.in`,
        department,
        designation: designation.trim() || 'Operator',
        joiningDate: joiningDate.trim() || '03/09/2026',
        shiftId,
        shiftName,
        fingerprintId: Number(fingerprintId),
        overtimeRate: Number(overtimeRate || 80),
        active: true,
        status: 'Active',
      } as any);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={employeeToEdit ? `Edit Profile: ${employeeToEdit.name}` : 'Enroll New Employee'}
      subtitle={
        employeeToEdit
          ? `Update parameters for ${employeeToEdit.id} in Firestore`
          : 'Create new personnel document in Firestore employees collection'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Employee ID */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Employee ID *
            </label>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-id"
                type="text"
                required
                disabled={Boolean(employeeToEdit)}
                placeholder="e.g. EMP002"
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs font-mono font-semibold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden disabled:bg-slate-100"
              />
            </div>
          </div>

          {/* Employee Name */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-name"
                type="text"
                required
                placeholder="e.g. Ashik Das"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Department *
            </label>
            <div className="relative">
              <Building2 className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                id="form-emp-department"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="Production">Production</option>
                <option value="Assembly">Assembly</option>
                <option value="Quality Control">Quality Control</option>
                <option value="Logistics">Logistics</option>
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Designation *
            </label>
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-designation"
                type="text"
                required
                placeholder="e.g. Operator"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Shift Assignment */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Work Shift *
            </label>
            <div className="relative">
              <Clock className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                id="form-emp-shift"
                value={shiftId}
                onChange={e => setShiftId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                {shifts.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.startTime} – {s.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fingerprint ID (MUST REMAIN NUMBER) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Fingerprint Sensor Slot ID * (Number)
            </label>
            <div className="relative">
              <Fingerprint className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-fingerprint"
                type="number"
                min="1"
                max="1000"
                required
                value={fingerprintId}
                onChange={e => setFingerprintId(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs font-semibold text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Stored as numeric fingerprintId</span>
          </div>

          {/* Overtime Rate */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Overtime Rate (₹ / completed hour) *
            </label>
            <div className="relative">
              <DollarSign className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-ot-rate"
                type="number"
                min="0"
                step="5"
                required
                value={overtimeRate}
                onChange={e => setOvertimeRate(Number(e.target.value))}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Default: ₹80 per complete block</span>
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Joining Date
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-joining"
                type="text"
                placeholder="DD/MM/YYYY"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-phone"
                type="tel"
                placeholder="+91 98321 45678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                id="form-emp-email"
                type="email"
                placeholder="ashik.das@omove.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Active Toggle if Editing */}
        {employeeToEdit && (
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <span className="text-xs font-medium text-slate-700">
                Active Employee (visible in active workforce & punch lists)
              </span>
            </label>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-save-employee-submit"
            type="submit"
            className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            {employeeToEdit ? 'Save Changes' : 'Enroll Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
