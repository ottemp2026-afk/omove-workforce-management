export type WorkStatus = 'NOT STARTED' | 'WORKING' | 'WORK COMPLETED' | 'ON LEAVE';

export interface Employee {
  id: string;
  employeeId?: string;
  name: string;
  phone: string;
  email: string;
  department: string;
  designation: string;
  shiftId: string;
  shiftName?: string;
  fingerprintId: number;
  joiningDate: string;
  overtimeRate: number; // ₹ per hour
  active?: boolean;
  status: 'Active' | 'Inactive' | 'On Leave';
  avatarInitials?: string;
}

export interface Shift {
  id: string;
  shiftId?: string;
  name: string;
  startTime: string;
  endTime: string;
  normalHours: number;
  assignedEmployees?: number;
  status?: 'Active' | 'Inactive';
  colorTag?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department?: string;
  fingerprintId?: number;
  date: string;
  shift?: string;
  shiftId?: string;
  deviceId?: string;
  inTime: string;
  outTime: string;
  workHours?: string;
  regularHours: number | string;
  overtimeHours: number | string;
  overtimeRate?: number;
  otRate: number;
  overtimeAmount?: number;
  otAmount: number;
  status: 'Completed' | 'Working' | 'Late' | 'Half Day' | 'On Leave';
  biometricMatchScore?: number;
  inTimestamp?: number;
  outTimestamp?: number;
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
}

export interface LiveBiometricActivity {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  fingerprintId: number;
  time: string;
  action: 'WORK IN' | 'WORK OUT';
  status: 'Active' | 'Completed';
  sensorId: string;
  matchScore: number;
}

export interface LivePunchAlert {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  fingerprintId: number;
  action: 'WORK IN' | 'WORK OUT';
  time: string;
  date: string;
  matchScore: number;
  shift?: string;
  workHours?: string;
  overtimeHours?: number | string;
  overtimeAmount?: number;
  timestamp: number;
}

export interface HardwareStatus {
  esp32: 'Online' | 'Offline';
  r307s: 'Ready' | 'Reading' | 'Offline';
  ds3231Rtc: 'Synchronized' | 'Drift' | 'Offline';
  oled: 'Active' | 'Standby' | 'Offline';
  wifiRssi: string;
  ipAddress: string;
  lastSyncTime: string;
  enrolledFingersCount: number;
}

export type AppRoute = 
  | '/'
  | '/live-ledger'
  | '/attendance'
  | '/subscription'
  | '/contact'
  | '/admin'
  | '/admin/employees'
  | '/admin/attendance'
  | '/admin/shifts'
  | '/admin/overtime'
  | '/admin/reports'
  | '/admin/settings';
