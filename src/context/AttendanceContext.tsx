import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { 
  Employee, 
  Shift, 
  AttendanceRecord, 
  LiveBiometricActivity, 
  LivePunchAlert,
  HardwareStatus, 
  WorkStatus 
} from '../types';
import { 
  INITIAL_SHIFTS, 
  INITIAL_HARDWARE 
} from '../data/mockData';
import {
  NORMAL_WORK_MINUTES,
  DEFAULT_OVERTIME_RATE,
  calculateOvertimeFromMinutes,
  formatMinutesToHoursMinutes,
  computeMinutesBetweenTimes,
  parseDateTimeToTimestamp,
} from '../utils/overtime';
import { playPunchChime } from '../utils/soundEffects';
import { db, auth } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AttendanceContextType {
  // Employee View
  selectedEmployee: Employee | undefined;
  setSelectedEmployeeId: (id: string) => void;
  todayWorkStatus: WorkStatus;
  todayInTime: string;
  todayWorkHours: string;
  todayOvertime: string;
  todayInTimestamp?: number;
  activeAttendanceRecord?: AttendanceRecord;
  
  // Data Collections
  employees: Employee[];
  shifts: Shift[];
  attendanceRecords: AttendanceRecord[];
  liveLogs: LiveBiometricActivity[];
  hardware: HardwareStatus;
  isFirebaseConnected: boolean;
  firestoreError: string | null;
  
  // Actions
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string, permanent?: boolean) => Promise<void>;
  toggleEmployeeStatus: (id: string) => Promise<void>;
  updateShift: (id: string, shiftData: Partial<Shift>) => Promise<void>;
  simulateBiometricScan: (empIdOrFingerprint: string | number, forcedAction?: 'WORK IN' | 'WORK OUT') => Promise<void>;
  
  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Live Punch Pop-up (5-Second Admin Alert)
  livePunchAlert: LivePunchAlert | null;
  triggerLivePunchAlert: (alert: LivePunchAlert) => void;
  dismissLivePunchAlert: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Timezone-safe formatting for India Standard Time (Asia/Kolkata)
export function getTodayDateStr(): string {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function getFormattedCurrentTime(): string {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = String(hours % 12 || 12).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ZERO mock employee defaults - real Firestore is the single source of truth
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [liveLogs, setLiveLogs] = useState<LiveBiometricActivity[]>([]);
  const [hardware, setHardware] = useState<HardwareStatus>(INITIAL_HARDWARE);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('EMP001');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(auth.currentUser);

  // Re-sync with Firebase Auth state so listeners refresh when admin logs in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
    });
    return () => unsub();
  }, []);

  // Scan cooldown tracker (30 seconds per employee)
  const lastScanTimes = useRef<Record<string, number>>({});

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Live Punch Alert Pop-up state (5 seconds display for Admin Panel)
  const [livePunchAlert, setLivePunchAlert] = useState<LivePunchAlert | null>(null);
  const livePunchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissLivePunchAlert = () => {
    if (livePunchTimerRef.current) {
      clearTimeout(livePunchTimerRef.current);
      livePunchTimerRef.current = null;
    }
    setLivePunchAlert(null);
  };

  const triggerLivePunchAlert = (alert: LivePunchAlert) => {
    if (livePunchTimerRef.current) {
      clearTimeout(livePunchTimerRef.current);
    }
    setLivePunchAlert(alert);
    playPunchChime(alert.action);

    // Stay for exactly 5 seconds (5000ms)
    livePunchTimerRef.current = setTimeout(() => {
      setLivePunchAlert(null);
      livePunchTimerRef.current = null;
    }, 5000);
  };

  // Helper to resolve shift display name
  const resolveShiftName = (shiftId?: string): string => {
    if (!shiftId) return 'Shift A';
    const found = shifts.find(s => s.id === shiftId || s.shiftId === shiftId);
    if (found) return found.name;
    if (shiftId.includes('C')) return 'Shift C';
    if (shiftId.includes('B')) return 'Shift B';
    return 'Shift A';
  };

  // 1. Subscribe to Firestore `shifts` collection
  useEffect(() => {
    try {
      const shiftsCol = collection(db, 'shifts');
      const unsubscribe = onSnapshot(shiftsCol, (snapshot) => {
        setIsFirebaseConnected(true);
        setFirestoreError(null);
        if (!snapshot.empty) {
          const loadedShifts: Shift[] = snapshot.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              shiftId: data.shiftId || d.id,
              name: data.name || (d.id === 'SHIFT-C' ? 'Shift C' : d.id === 'SHIFT-B' ? 'Shift B' : 'Shift A'),
              startTime: data.startTime || (d.id === 'SHIFT-C' ? '22:00' : d.id === 'SHIFT-B' ? '14:00' : '06:00'),
              endTime: data.endTime || (d.id === 'SHIFT-C' ? '06:00' : d.id === 'SHIFT-B' ? '22:00' : '14:00'),
              normalHours: Number(data.normalHours || 8),
              assignedEmployees: 0,
              status: 'Active',
              colorTag: d.id.includes('C') ? 'purple' : d.id.includes('B') ? 'amber' : 'blue',
            };
          });
          setShifts(loadedShifts);
        } else {
          // If empty in Firestore and user is authenticated, initialize standard SHIFT-A, SHIFT-B, SHIFT-C
          if (auth.currentUser) {
            INITIAL_SHIFTS.forEach(async (initShift) => {
              try {
                await setDoc(doc(db, 'shifts', initShift.id), {
                  shiftId: initShift.id,
                  name: initShift.name,
                  startTime: initShift.startTime,
                  endTime: initShift.endTime,
                  normalHours: 8,
                });
              } catch {
                // Ignore if already set
              }
            });
          }
        }
      }, (err) => {
        console.warn('Firestore shifts listener note:', err.message);
        if (err.message.includes('insufficient permissions')) {
          setFirestoreError('Firestore permission notice: Please sign in as Admin to access database.');
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore shifts init error:', e);
    }
  }, [authUser]);

  // 2. Subscribe to Firestore `employees` collection (SINGLE SOURCE OF TRUTH)
  useEffect(() => {
    try {
      const employeesCol = collection(db, 'employees');
      const unsubscribe = onSnapshot(employeesCol, (snapshot) => {
        setIsFirebaseConnected(true);
        setFirestoreError(null);
        if (!snapshot.empty) {
          const loadedEmployees: Employee[] = snapshot.docs.map((d) => {
            const data = d.data();
            const initials = (data.name || 'EP')
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase();

            const isActive = data.active !== undefined ? Boolean(data.active) : true;

            return {
              id: d.id,
              employeeId: data.employeeId || d.id,
              name: data.name || 'Unnamed Employee',
              phone: data.phone || '',
              email: data.email || '',
              department: data.department || 'Production',
              designation: data.designation || 'Operator',
              shiftId: data.shiftId || 'SHIFT-A',
              shiftName: resolveShiftName(data.shiftId),
              fingerprintId: Number(data.fingerprintId !== undefined ? data.fingerprintId : 1),
              joiningDate: data.joiningDate || '03/09/2026',
              overtimeRate: Number(data.overtimeRate || 80),
              active: isActive,
              status: isActive ? 'Active' : 'Inactive',
              avatarInitials: initials,
            };
          });

          // Sort by employeeId
          loadedEmployees.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

          setEmployees(loadedEmployees);

          // Update assigned employees count in shifts
          setShifts(prevShifts => prevShifts.map(s => ({
            ...s,
            assignedEmployees: loadedEmployees.filter(e => (e.shiftId === s.id || e.shiftId === s.shiftId) && e.active).length
          })));
        } else {
          // Zero employees in Firestore - strictly set empty array (never seed mock data)
          setEmployees([]);
        }
      }, (err) => {
        console.warn('Firestore employees listener note:', err.message);
        if (err.message.includes('insufficient permissions')) {
          setFirestoreError('Firestore permission notice: Please sign in as Admin to access database.');
          setIsFirebaseConnected(false);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore employees init error:', e);
    }
  }, [authUser]);

  // Track initial load so alert popup only fires on new incoming punch events
  const initialAttendanceLoadedRef = useRef(false);

  // 3. Subscribe to Firestore `attendance` collection
  useEffect(() => {
    try {
      const attendanceCol = collection(db, 'attendance');
      const unsubscribe = onSnapshot(attendanceCol, (snapshot) => {
        setIsFirebaseConnected(true);
        setFirestoreError(null);

        // Check for real-time changes after initial fetch
        if (!initialAttendanceLoadedRef.current) {
          initialAttendanceLoadedRef.current = true;
        } else {
          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            if (change.type === 'added') {
              triggerLivePunchAlert({
                id: `ALERT-${change.doc.id}`,
                employeeId: data.employeeId || 'EMP',
                employeeName: data.employeeName || 'Staff Member',
                department: data.department || 'Operations',
                fingerprintId: Number(data.fingerprintId || 1),
                action: 'WORK IN',
                time: data.inTime || getFormattedCurrentTime(),
                date: data.date || getTodayDateStr(),
                matchScore: data.biometricMatchScore || 99.4,
                shift: resolveShiftName(data.shiftId),
                timestamp: Date.now(),
              });
            } else if (change.type === 'modified' && data.status === 'Completed' && data.outTime && data.outTime !== '--:--') {
              triggerLivePunchAlert({
                id: `ALERT-${change.doc.id}`,
                employeeId: data.employeeId || 'EMP',
                employeeName: data.employeeName || 'Staff Member',
                department: data.department || 'Operations',
                fingerprintId: Number(data.fingerprintId || 1),
                action: 'WORK OUT',
                time: data.outTime || getFormattedCurrentTime(),
                date: data.date || getTodayDateStr(),
                matchScore: data.biometricMatchScore || 99.4,
                shift: resolveShiftName(data.shiftId),
                workHours: data.workHours,
                overtimeHours: data.overtimeHours,
                overtimeAmount: data.overtimeAmount,
                timestamp: Date.now(),
              });
            }
          });
        }
        if (!snapshot.empty) {
          const loadedRecords: AttendanceRecord[] = snapshot.docs.map((d) => {
            const data = d.data();
            let inTs = typeof data.inTimestamp === 'number' ? data.inTimestamp : Number(data.inTimestamp);
            if (!inTs || isNaN(inTs) || inTs > Date.now() + 60000) {
              inTs = parseDateTimeToTimestamp(data.date, data.inTime);
            }
            
            // Format workHours and overtime display strings
            let workHoursStr = data.workHours;
            if (!workHoursStr) {
              if (data.status === 'Working') {
                workHoursStr = '--:--';
              } else if (data.outTime && data.inTime && data.outTime !== '--:--') {
                const diffMins = computeMinutesBetweenTimes(data.inTime, data.outTime);
                workHoursStr = formatMinutesToHoursMinutes(diffMins);
              } else {
                workHoursStr = '08h 00m';
              }
            }

            let regularHoursVal = data.regularHours;
            if (regularHoursVal === undefined) {
              regularHoursVal = '08h 00m';
            } else if (typeof regularHoursVal === 'number') {
              regularHoursVal = formatMinutesToHoursMinutes(Math.round(regularHoursVal * 60));
            }

            let overtimeHoursVal = data.overtimeHours;
            if (overtimeHoursVal === undefined) {
              overtimeHoursVal = '00h 00m';
            } else if (typeof overtimeHoursVal === 'number') {
              overtimeHoursVal = `${String(overtimeHoursVal).padStart(2, '0')}h 00m`;
            }

            return {
              id: d.id,
              employeeId: data.employeeId || 'EMP001',
              employeeName: data.employeeName || 'Staff Member',
              department: data.department || 'Production',
              fingerprintId: Number(data.fingerprintId || 1),
              date: data.date || getTodayDateStr(),
              shift: resolveShiftName(data.shiftId),
              shiftId: data.shiftId || 'SHIFT-A',
              deviceId: data.deviceId || 'ESP32-001',
              inTime: data.inTime || '--:--',
              outTime: data.outTime || '--:--',
              workHours: workHoursStr,
              regularHours: regularHoursVal,
              overtimeHours: overtimeHoursVal,
              overtimeRate: Number(data.overtimeRate || 80),
              otRate: Number(data.overtimeRate || 80),
              overtimeAmount: Number(data.overtimeAmount || 0),
              otAmount: Number(data.overtimeAmount || 0),
              status: data.status || 'Completed',
              inTimestamp: inTs,
              outTimestamp: data.outTimestamp || null,
              biometricMatchScore: data.biometricMatchScore || 99,
            };
          });

          // Sort records descending (most recent first)
          loadedRecords.sort((a, b) => {
            const timeA = a.inTimestamp || 0;
            const timeB = b.inTimestamp || 0;
            return timeB - timeA;
          });

          setAttendanceRecords(loadedRecords);
        } else {
          setAttendanceRecords([]);
        }
      }, (err) => {
        console.warn('Firestore attendance listener note:', err.message);
        if (err.message.includes('insufficient permissions')) {
          setFirestoreError('Firestore permission notice: Please sign in as Admin to access database.');
          setIsFirebaseConnected(false);
        }
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore attendance init error:', e);
    }
  }, [authUser]);

  // Synchronize selected employee ID when employees list loads
  useEffect(() => {
    if (employees.length > 0) {
      const exists = employees.some(e => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId);
      if (!exists) {
        setSelectedEmployeeId(employees[0].id);
      }
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = useMemo(() => {
    if (employees.length === 0) return undefined;
    return employees.find(e => e.id === selectedEmployeeId || e.employeeId === selectedEmployeeId) || employees[0];
  }, [employees, selectedEmployeeId]);

  // Derive Today's Work Status & accurate IN timestamp for the selected employee
  const { 
    todayWorkStatus, 
    todayInTime, 
    todayWorkHours, 
    todayOvertime, 
    todayInTimestamp, 
    activeAttendanceRecord 
  } = useMemo(() => {
    if (!selectedEmployee) {
      return {
        todayWorkStatus: 'NOT STARTED' as WorkStatus,
        todayInTime: '--:--',
        todayWorkHours: '00h 00m',
        todayOvertime: '00h 00m',
        todayInTimestamp: undefined,
        activeAttendanceRecord: undefined,
      };
    }

    if (selectedEmployee.status === 'On Leave' || selectedEmployee.active === false) {
      return {
        todayWorkStatus: selectedEmployee.status === 'On Leave' ? 'ON LEAVE' as WorkStatus : 'NOT STARTED' as WorkStatus,
        todayInTime: '--:--',
        todayWorkHours: '00h 00m',
        todayOvertime: '00h 00m',
        todayInTimestamp: undefined,
        activeAttendanceRecord: undefined,
      };
    }

    const empId = selectedEmployee.employeeId || selectedEmployee.id;

    // 1. Check if an active 'Working' attendance record exists in Firestore attendance collection
    const activeWorkingRecord = attendanceRecords.find(
      r => (
        r.employeeId === empId || 
        r.employeeId === selectedEmployee.id || 
        (selectedEmployee.fingerprintId && Number(r.fingerprintId) === Number(selectedEmployee.fingerprintId))
      ) && r.status === 'Working'
    );

    if (activeWorkingRecord) {
      let inTs = activeWorkingRecord.inTimestamp;
      if (!inTs || isNaN(inTs) || inTs > Date.now() + 60000) {
        inTs = parseDateTimeToTimestamp(activeWorkingRecord.date, activeWorkingRecord.inTime);
      }
      return {
        todayWorkStatus: 'WORKING' as WorkStatus,
        todayInTime: activeWorkingRecord.inTime,
        todayWorkHours: '--:--',
        todayOvertime: typeof activeWorkingRecord.overtimeHours === 'number' 
          ? `${String(activeWorkingRecord.overtimeHours).padStart(2, '0')}h 00m` 
          : String(activeWorkingRecord.overtimeHours || '00h 00m'),
        todayInTimestamp: inTs,
        activeAttendanceRecord: activeWorkingRecord,
      };
    }

    // 2. Check if a completed record exists for today or recent shift
    const todayDate = getTodayDateStr();
    const todayCompletedRecord = attendanceRecords.find(
      r => (
        r.employeeId === empId || 
        r.employeeId === selectedEmployee.id || 
        (selectedEmployee.fingerprintId && Number(r.fingerprintId) === Number(selectedEmployee.fingerprintId))
      ) && 
      r.status === 'Completed' && 
      (r.date === todayDate || (r.inTimestamp && Date.now() - r.inTimestamp < 24 * 3600 * 1000))
    );

    if (todayCompletedRecord) {
      const inTs = todayCompletedRecord.inTimestamp || parseDateTimeToTimestamp(todayCompletedRecord.date, todayCompletedRecord.inTime);
      const otStr = typeof todayCompletedRecord.overtimeHours === 'number'
        ? `${String(todayCompletedRecord.overtimeHours).padStart(2, '0')}h 00m`
        : String(todayCompletedRecord.overtimeHours || '00h 00m');

      return {
        todayWorkStatus: 'WORK COMPLETED' as WorkStatus,
        todayInTime: todayCompletedRecord.inTime,
        todayWorkHours: todayCompletedRecord.workHours || '08h 00m',
        todayOvertime: otStr,
        todayInTimestamp: inTs,
        activeAttendanceRecord: todayCompletedRecord,
      };
    }

    return {
      todayWorkStatus: 'NOT STARTED' as WorkStatus,
      todayInTime: '--:--',
      todayWorkHours: '00h 00m',
      todayOvertime: '00h 00m',
      todayInTimestamp: undefined,
      activeAttendanceRecord: undefined,
    };
  }, [selectedEmployee, attendanceRecords]);

  // Employee CRUD operations against Firestore
  const addEmployee = async (empData: Omit<Employee, 'id'>) => {
    // Generate sequential ID or use employeeId if provided
    let newId = (empData as any).employeeId;
    if (!newId) {
      // Find highest EMP number among existing employees
      const maxNum = employees.reduce((max, e) => {
        const match = e.id.match(/EMP(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      newId = `EMP${String(maxNum + 1).padStart(3, '0')}`;
    }

    const newEmpRecord = {
      employeeId: newId,
      name: empData.name,
      phone: empData.phone || '',
      email: empData.email || '',
      department: empData.department || 'Production',
      designation: empData.designation || 'Operator',
      joiningDate: empData.joiningDate || getTodayDateStr(),
      shiftId: empData.shiftId || 'SHIFT-A',
      fingerprintId: Number(empData.fingerprintId || 1),
      active: true,
      overtimeRate: Number(empData.overtimeRate || 80),
    };

    try {
      await setDoc(doc(db, 'employees', newId), newEmpRecord);
      addToast({
        type: 'success',
        title: 'Employee Enrolled',
        message: `${newEmpRecord.name} (${newId}) saved to Firestore with Fingerprint #${newEmpRecord.fingerprintId}`,
      });
    } catch (err: unknown) {
      console.error('Failed to add employee:', err);
      addToast({
        type: 'error',
        title: 'Firestore Error',
        message: `Failed to save employee to Firestore: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  const updateEmployee = async (id: string, updatedFields: Partial<Employee>) => {
    const targetId = id;
    const cleanFields: Record<string, unknown> = { ...updatedFields };
    if (cleanFields.fingerprintId !== undefined) cleanFields.fingerprintId = Number(cleanFields.fingerprintId);
    if (cleanFields.overtimeRate !== undefined) cleanFields.overtimeRate = Number(cleanFields.overtimeRate);
    if (cleanFields.active !== undefined) cleanFields.active = Boolean(cleanFields.active);

    try {
      await updateDoc(doc(db, 'employees', targetId), cleanFields);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: `Employee ${id} updated in Firestore.`,
      });
    } catch (err) {
      console.error('Update doc error:', err);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: `Could not update Firestore document: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  // Delete employee: defaults to soft delete (active = false)
  const deleteEmployee = async (id: string, permanent: boolean = false) => {
    try {
      if (permanent) {
        await deleteDoc(doc(db, 'employees', id));
        addToast({
          type: 'info',
          title: 'Employee Deleted',
          message: `Employee ${id} permanently removed from Firestore.`,
        });
      } else {
        await updateDoc(doc(db, 'employees', id), { active: false });
        addToast({
          type: 'info',
          title: 'Employee Deactivated',
          message: `Employee ${id} marked as inactive (active: false).`,
        });
      }
    } catch (err) {
      console.error('Delete doc error:', err);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: `Firestore operation failed: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  const toggleEmployeeStatus = async (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const nextActive = !emp.active;

    try {
      await updateDoc(doc(db, 'employees', id), { active: nextActive });
      addToast({
        type: 'info',
        title: 'Status Synchronized',
        message: `${emp.name} is now ${nextActive ? 'Active' : 'Inactive'}.`,
      });
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const updateShift = async (id: string, shiftData: Partial<Shift>) => {
    const cleanShift: Record<string, unknown> = { ...shiftData };
    if (cleanShift.normalHours !== undefined) cleanShift.normalHours = Number(cleanShift.normalHours);

    try {
      await updateDoc(doc(db, 'shifts', id), cleanShift);
      addToast({
        type: 'success',
        title: 'Shift Timings Updated',
        message: `Shift ${id} updated in Firestore.`,
      });
    } catch (err) {
      console.error('Update shift error:', err);
      addToast({
        type: 'error',
        title: 'Shift Update Failed',
        message: `Firestore error: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  /**
   * Biometric Scan Execution & Automation:
   * Specifications:
   * 1. Match employee by fingerprintId (NUMBER) or employeeId
   * 2. If no employee matches -> "Fingerprint not registered" (do NOT create attendance)
   * 3. Enforce 30s scan cooldown per employee -> "Please wait before scanning again."
   * 4. Check active attendance:
   *    - If no active attendance -> WORK IN:
   *      - create attendance record in Firestore
   *      - status: 'Working', inTime: actual current time, outTime: null, inTimestamp: Date.now()
   *      - deviceId: 'ESP32-001'
   *    - If active attendance exists -> WORK OUT:
   *      - update EXISTING attendance document
   *      - outTime: actual current time, outTimestamp: Date.now()
   *      - calculate total worked duration, regular hours, complete 1-hour overtime blocks, overtime pay
   *      - status: 'Completed'
   */
  const simulateBiometricScan = async (
    empIdOrFingerprint: string | number, 
    forcedAction?: 'WORK IN' | 'WORK OUT'
  ) => {
    const numFp = Number(empIdOrFingerprint);

    // 1. Find employee by fingerprintId (NUMBER) or employeeId/id
    const emp = employees.find(e => 
      e.fingerprintId === numFp || 
      e.id === empIdOrFingerprint || 
      e.employeeId === empIdOrFingerprint
    );

    if (!emp) {
      addToast({
        type: 'error',
        title: 'Fingerprint not registered',
        message: `Fingerprint ID #${empIdOrFingerprint} does not match any registered employee in Firestore.`,
      });
      return;
    }

    const empId = emp.employeeId || emp.id;
    // Auto-switch view to the employee whose attendance is being recorded
    setSelectedEmployeeId(emp.id);

    const now = new Date();
    const nowTs = now.getTime();

    // 2. Duplicate Scan Protection (30-second cooldown)
    const lastScan = lastScanTimes.current[empId] || 0;
    if (nowTs - lastScan < 30 * 1000) {
      const remainingSecs = Math.ceil((30 * 1000 - (nowTs - lastScan)) / 1000);
      addToast({
        type: 'warning',
        title: 'Cooldown Active',
        message: `Please wait before scanning again. (${remainingSecs}s remaining)`,
      });
      return;
    }
    lastScanTimes.current[empId] = nowTs;

    const scanTimeStr = getFormattedCurrentTime();
    const todayDate = getTodayDateStr();

    // 3. Check if active attendance already exists for this employee
    const existingActiveRecord = attendanceRecords.find(
      r => (r.employeeId === empId || r.employeeId === emp.id) && r.status === 'Working'
    );

    // Determine action: either forced or auto-detected
    const action: 'WORK IN' | 'WORK OUT' = forcedAction || (existingActiveRecord ? 'WORK OUT' : 'WORK IN');

    // Update live memory log
    const newLog: LiveBiometricActivity = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      employeeId: empId,
      employeeName: emp.name,
      department: emp.department,
      fingerprintId: Number(emp.fingerprintId),
      time: scanTimeStr,
      action: action,
      status: action === 'WORK IN' ? 'Active' : 'Completed',
      sensorId: 'ESP32_R307S_01',
      matchScore: 99,
    };
    setLiveLogs(prev => [newLog, ...prev.slice(0, 19)]);
    setHardware(prev => ({
      ...prev,
      lastSyncTime: 'Just now (< 1s)',
    }));

    if (action === 'WORK OUT') {
      // 4. WORK OUT Flow: Update EXISTING attendance document
      const recordToClose = existingActiveRecord || attendanceRecords.find(
        r => (r.employeeId === empId || r.employeeId === emp.id)
      );

      const inTimestamp: number = recordToClose?.inTimestamp || (nowTs - 8 * 3600 * 1000);
      const inTimeStr = recordToClose?.inTime && recordToClose.inTime !== '--:--' ? recordToClose.inTime : '06:00 AM';

      // Total work calculation from punch-in timestamp
      const elapsedMs = Math.max(0, nowTs - inTimestamp);
      const totalWorkMinutes = Math.max(1, Math.floor(elapsedMs / (1000 * 60)));

      // Regular & Overtime
      const regularMinutes = Math.min(totalWorkMinutes, NORMAL_WORK_MINUTES);
      const regularHoursNumber = Math.round((regularMinutes / 60) * 100) / 100;
      const regularHoursFormatted = formatMinutesToHoursMinutes(regularMinutes);

      // COMPLETE 1-HOUR BLOCKS ONLY:
      // Formula:
      // regularMinutes = Math.min(totalWorkMinutes, 480)
      // overtimeMinutes = Math.max(totalWorkMinutes - 480, 0)
      // overtimeHours = Math.floor(overtimeMinutes / 60)
      // overtimeAmount = overtimeHours * overtimeRate
      const { otHours, otAmount, overtimeHoursFormatted } = calculateOvertimeFromMinutes(
        totalWorkMinutes,
        emp.overtimeRate || DEFAULT_OVERTIME_RATE
      );
      const totalWorkHoursFormatted = formatMinutesToHoursMinutes(totalWorkMinutes);

      const targetDocId = recordToClose?.id || `ATT-${Date.now().toString().slice(-6)}`;

      const updatedRecordPayload = {
        employeeId: empId,
        employeeName: emp.name,
        department: emp.department,
        fingerprintId: Number(emp.fingerprintId),
        date: recordToClose?.date || todayDate,
        shiftId: emp.shiftId || 'SHIFT-A',
        inTime: inTimeStr,
        inTimestamp: inTimestamp,
        outTime: scanTimeStr,
        outTimestamp: nowTs,
        regularHours: regularHoursNumber,
        overtimeHours: otHours,
        overtimeRate: emp.overtimeRate || DEFAULT_OVERTIME_RATE,
        overtimeAmount: otAmount,
        deviceId: 'ESP32-001',
        status: 'Completed',
        workHours: totalWorkHoursFormatted,
      };

      try {
        await setDoc(doc(db, 'attendance', targetDocId), updatedRecordPayload, { merge: true });
      } catch (err) {
        console.warn('Firestore attendance write error:', err);
      }

      addToast({
        type: 'success',
        title: '✓ Attendance recorded',
        message: `${emp.name} (${empId}) WORK OUT at ${scanTimeStr}. Worked: ${totalWorkHoursFormatted}. OT: ${otHours}h complete block (₹${otAmount.toFixed(0)}).`,
      });

      triggerLivePunchAlert({
        id: `ALERT-${Date.now()}`,
        employeeId: empId,
        employeeName: emp.name,
        department: emp.department,
        fingerprintId: Number(emp.fingerprintId),
        action: 'WORK OUT',
        time: scanTimeStr,
        date: todayDate,
        matchScore: 99.4,
        shift: resolveShiftName(emp.shiftId),
        workHours: totalWorkHoursFormatted,
        overtimeHours: otHours,
        overtimeAmount: otAmount,
        timestamp: nowTs,
      });

    } else {
      // 5. WORK IN Flow: Create new attendance document
      // Use auto-generated document ID in attendance collection
      const newAttendanceRef = doc(collection(db, 'attendance'));
      const recordId = newAttendanceRef.id;

      const newAttendancePayload = {
        employeeId: empId,
        employeeName: emp.name,
        department: emp.department,
        fingerprintId: Number(emp.fingerprintId),
        date: todayDate,
        shiftId: emp.shiftId || 'SHIFT-A',
        inTime: scanTimeStr,
        inTimestamp: nowTs,
        outTime: null,
        outTimestamp: null,
        regularHours: 0,
        overtimeHours: 0,
        overtimeRate: emp.overtimeRate || DEFAULT_OVERTIME_RATE,
        overtimeAmount: 0,
        deviceId: 'ESP32-001',
        status: 'Working',
      };

      try {
        await setDoc(newAttendanceRef, newAttendancePayload);
      } catch (err) {
        console.warn('Firestore attendance write error:', err);
      }

      addToast({
        type: 'success',
        title: '✓ Attendance recorded',
        message: `${emp.name} (${empId}) WORK IN at ${scanTimeStr}. Live working timer initiated.`,
      });

      triggerLivePunchAlert({
        id: `ALERT-${Date.now()}`,
        employeeId: empId,
        employeeName: emp.name,
        department: emp.department,
        fingerprintId: Number(emp.fingerprintId),
        action: 'WORK IN',
        time: scanTimeStr,
        date: todayDate,
        matchScore: 99.4,
        shift: resolveShiftName(emp.shiftId),
        timestamp: nowTs,
      });
    }
  };

  return (
    <AttendanceContext.Provider
      value={{
        selectedEmployee,
        setSelectedEmployeeId,
        todayWorkStatus,
        todayInTime,
        todayWorkHours,
        todayOvertime,
        todayInTimestamp,
        activeAttendanceRecord,
        employees,
        shifts,
        attendanceRecords,
        liveLogs,
        hardware,
        isFirebaseConnected,
        firestoreError,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        updateShift,
        simulateBiometricScan,
        toasts,
        addToast,
        removeToast,
        livePunchAlert,
        triggerLivePunchAlert,
        dismissLivePunchAlert,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
