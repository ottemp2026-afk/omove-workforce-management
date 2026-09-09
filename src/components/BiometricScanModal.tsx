import React, { useState, useEffect } from 'react';
import { useAttendance, getFormattedCurrentTime } from '../context/AttendanceContext';
import { Modal } from './Modal';
import { Fingerprint, Check, Loader2, AlertCircle } from 'lucide-react';

interface BiometricScanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BiometricScanModal: React.FC<BiometricScanModalProps> = ({ isOpen, onClose }) => {
  const { employees, attendanceRecords, simulateBiometricScan, setSelectedEmployeeId } = useAttendance();
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [action, setAction] = useState<'WORK IN' | 'WORK OUT'>('WORK IN');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{
    name: string;
    empId: string;
    action: 'WORK IN' | 'WORK OUT';
    time: string;
  } | null>(null);

  // Sync selected employee when employees list loads
  useEffect(() => {
    if (employees.length > 0) {
      if (!selectedEmpId || !employees.some(e => e.id === selectedEmpId)) {
        setSelectedEmpId(employees[0].id);
      }
    }
  }, [employees, selectedEmpId]);

  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Auto-detect whether employee is currently working to suggest WORK IN or WORK OUT
  useEffect(() => {
    if (selectedEmp) {
      const activeRecord = attendanceRecords.find(
        r => (r.employeeId === selectedEmp.id || r.employeeId === selectedEmp.employeeId) && r.status === 'Working'
      );
      if (activeRecord) {
        setAction('WORK OUT');
      } else {
        setAction('WORK IN');
      }
    }
  }, [selectedEmp, attendanceRecords]);

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    setScanResult(null);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const activeRecord = attendanceRecords.find(
        r => (r.employeeId === emp.id || r.employeeId === emp.employeeId) && r.status === 'Working'
      );
      setAction(activeRecord ? 'WORK OUT' : 'WORK IN');
    }
  };

  const handleScan = async () => {
    if (!selectedEmp) return;
    setIsScanning(true);
    setScanResult(null);

    const timeStr = getFormattedCurrentTime();

    try {
      await simulateBiometricScan(selectedEmp.fingerprintId, action);
      setSelectedEmployeeId(selectedEmp.id);
      setIsScanning(false);
      setScanResult({
        name: selectedEmp.name,
        empId: selectedEmp.employeeId || selectedEmp.id,
        action: action,
        time: timeStr,
      });
    } catch {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
  };

  const handleClose = () => {
    setScanResult(null);
    setIsScanning(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Attendance"
      subtitle="Scan employee fingerprint"
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        {scanResult ? (
          /* Successful Scan State - Matches Section 24 */
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600">
              <Check className="h-5 w-5 stroke-[2.5]" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                ✓ Attendance recorded
              </p>
              <h3 className="mt-1.5 text-lg font-semibold text-slate-900">
                {scanResult.name}
              </h3>
              <p className="text-xs font-mono text-slate-500">
                {scanResult.empId}
              </p>
            </div>

            <div className="inline-flex flex-col items-center justify-center rounded-md border border-slate-200 bg-slate-50/80 px-6 py-2">
              <span className={`text-[11px] font-bold tracking-wider ${
                scanResult.action === 'WORK IN' ? 'text-emerald-700' : 'text-slate-700'
              }`}>
                {scanResult.action}
              </span>
              <span className="mt-0.5 text-base font-semibold text-slate-900">
                {scanResult.time}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 rounded-md border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Scan Another
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md bg-slate-900 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : employees.length === 0 ? (
          /* Empty employees state */
          <div className="py-6 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-600">
              No registered employees found in Firestore. Please add an employee first from the Admin Panel.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs text-white"
            >
              Close
            </button>
          </div>
        ) : (
          /* Ready to Scan State */
          <div className="space-y-3.5">
            {/* Employee Selector */}
            <div>
              <label htmlFor="sim-employee-select" className="block text-xs font-medium text-slate-700 mb-1">
                Employee
              </label>
              <select
                id="sim-employee-select"
                value={selectedEmpId}
                onChange={e => handleEmployeeChange(e.target.value)}
                disabled={isScanning}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-900 focus:border-slate-800 focus:outline-hidden transition-colors"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeId || emp.id}) — {emp.department} [Slot #{emp.fingerprintId}]
                  </option>
                ))}
              </select>
            </div>

            {/* Fingerprint Status Block */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fingerprint
              </label>
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/60 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">
                  <Fingerprint className={`h-5 w-5 ${isScanning ? 'animate-pulse text-emerald-600' : 'text-slate-600'}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">
                    {isScanning ? 'Scanning fingerprint minutiae...' : 'Ready to scan'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Sensor Slot #{selectedEmp?.fingerprintId || 1} • ESP32-001
                  </p>
                </div>
              </div>
            </div>

            {/* Scan Fingerprint Action */}
            <div className="pt-2">
              <button
                id="sim-modal-trigger-scan"
                type="button"
                onClick={handleScan}
                disabled={isScanning || !selectedEmp}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-slate-900 py-2.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-300" />
                    <span>Scanning Fingerprint...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 text-emerald-400" />
                    <span>Scan Fingerprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
