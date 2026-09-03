import { Employee, Shift, AttendanceRecord, LiveBiometricActivity, HardwareStatus } from '../types';

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'SHIFT-A',
    shiftId: 'SHIFT-A',
    name: 'Shift A',
    startTime: '06:00',
    endTime: '14:00',
    normalHours: 8,
    assignedEmployees: 0,
    status: 'Active',
    colorTag: 'blue',
  },
  {
    id: 'SHIFT-B',
    shiftId: 'SHIFT-B',
    name: 'Shift B',
    startTime: '14:00',
    endTime: '22:00',
    normalHours: 8,
    assignedEmployees: 0,
    status: 'Active',
    colorTag: 'amber',
  },
  {
    id: 'SHIFT-C',
    shiftId: 'SHIFT-C',
    name: 'Shift C',
    startTime: '22:00',
    endTime: '06:00',
    normalHours: 8,
    assignedEmployees: 0,
    status: 'Active',
    colorTag: 'purple',
  },
];

// Zero mock employees - real Firestore employees are the single source of truth
export const INITIAL_EMPLOYEES: Employee[] = [];

// Zero mock live logs
export const INITIAL_LIVE_LOGS: LiveBiometricActivity[] = [];

// Zero mock attendance records
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_HARDWARE: HardwareStatus = {
  esp32: 'Online',
  r307s: 'Ready',
  ds3231Rtc: 'Synchronized',
  oled: 'Active',
  wifiRssi: '-62 dBm',
  ipAddress: '192.168.1.145',
  lastSyncTime: 'Awaiting punch',
  enrolledFingersCount: 0,
};
