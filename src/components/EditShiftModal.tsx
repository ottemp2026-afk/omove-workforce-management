import React, { useState, useEffect } from 'react';
import { Shift } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { Modal } from './Modal';
import { Clock, Users } from 'lucide-react';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: Shift | null;
}

export const EditShiftModal: React.FC<EditShiftModalProps> = ({
  isOpen,
  onClose,
  shift,
}) => {
  const { updateShift } = useAttendance();

  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [normalHours, setNormalHours] = useState<number>(8);
  const [assignedEmployees, setAssignedEmployees] = useState(0);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  useEffect(() => {
    if (shift) {
      setName(shift.name);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
      setNormalHours(shift.normalHours || 8);
      setAssignedEmployees(shift.assignedEmployees || 0);
      setStatus(shift.status || 'Active');
    }
  }, [shift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shift) return;

    updateShift(shift.id, {
      name,
      startTime,
      endTime,
      normalHours: Number(normalHours),
      assignedEmployees: Number(assignedEmployees),
      status,
    });

    onClose();
  };

  if (!shift) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure Shift: ${shift.name}`}
      subtitle={`Update parameters for ${shift.id} in Firestore`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1">
            Shift Name *
          </label>
          <input
            id="shift-name-input"
            type="text"
            required
            placeholder="e.g. Shift A"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Start Time (24h or 12h) *
            </label>
            <input
              id="shift-start-time-input"
              type="text"
              required
              placeholder="06:00"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              End Time (e.g. 14:00, 06:00) *
            </label>
            <input
              id="shift-end-time-input"
              type="text"
              required
              placeholder="14:00"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Normal Hours *
            </label>
            <input
              id="shift-normal-hours-input"
              type="number"
              min="1"
              max="24"
              required
              value={normalHours}
              onChange={e => setNormalHours(Number(e.target.value))}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs font-medium text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Shift Status
            </label>
            <select
              id="shift-status-select"
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/50 py-1.5 px-2.5 text-xs text-slate-900 focus:border-slate-800 focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {shift.id === 'SHIFT-C' && (
          <div className="rounded-md bg-purple-50 p-2.5 border border-purple-200 text-purple-900">
            <p className="text-[11px] leading-relaxed">
              <span className="font-semibold">Overnight Shift Notice:</span> Shift C spans overnight across midnight (22:00 → 06:00). Work duration and live counters account for the midnight date transition automatically.
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            id="shift-save-btn"
            type="submit"
            className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Update Shift in Firestore
          </button>
        </div>
      </form>
    </Modal>
  );
};
