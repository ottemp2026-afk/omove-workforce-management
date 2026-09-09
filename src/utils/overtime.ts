/**
 * OVERTIME CALCULATION UTILITY (Authoritative)
 * 
 * IMPORTANT OVERTIME RULE:
 * Overtime must be calculated in COMPLETE 1-HOUR BLOCKS only.
 * Normal working hours = 8 hours (480 minutes)
 * Overtime rate = ₹80 per completed hour (or employee specific rate).
 * 
 * DO NOT calculate overtime proportionally by minutes.
 * 
 * Formula:
 * OT Hours = FLOOR((Total Work Minutes - 480) / 60)
 * OT Pay = OT Hours × 80
 * 
 * Verification Examples:
 * 8h 05m (485m) -> 0 OT hours -> ₹0
 * 8h 30m (510m) -> 0 OT hours -> ₹0
 * 8h 59m (539m) -> 0 OT hours -> ₹0
 * 9h 00m (540m) -> 1 OT hour  -> ₹80
 * 9h 05m (545m) -> 1 OT hour  -> ₹80
 * 9h 59m (599m) -> 1 OT hour  -> ₹80
 * 10h 00m (600m) -> 2 OT hours -> ₹160
 */

import { AttendanceRecord } from '../types';

export const NORMAL_WORK_MINUTES = 480; // 8 hours
export const DEFAULT_OVERTIME_RATE = 80; // ₹80 per complete hour

/**
 * Parses duration strings like "08h 15m", "10h 19m", "8h 05m", "9h 00m" to total minutes.
 */
export function parseDurationToMinutes(durationStr: string): number {
  if (!durationStr || durationStr === '--:--' || durationStr === '00h 00m') {
    return 0;
  }
  const match = durationStr.match(/(\d+)\s*h(?:ours?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?/i);
  if (match) {
    const hours = parseInt(match[1], 10) || 0;
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + minutes;
  }

  // Fallback for HH:MM format
  const colonParts = durationStr.split(':');
  if (colonParts.length === 2) {
    const h = parseInt(colonParts[0], 10) || 0;
    const m = parseInt(colonParts[1], 10) || 0;
    return h * 60 + m;
  }

  return 0;
}

/**
 * Calculates overtime based on Total Work Minutes in complete 1-hour blocks only.
 * Formula: OT Hours = FLOOR((Total Work Minutes - 480) / 60)
 * OT Pay = OT Hours * rate (default ₹80)
 */
export function calculateOvertimeFromMinutes(
  totalWorkMinutes: number,
  rate: number = DEFAULT_OVERTIME_RATE
): {
  otHours: number;
  otAmount: number;
  overtimeHoursFormatted: string;
} {
  if (totalWorkMinutes <= NORMAL_WORK_MINUTES) {
    return {
      otHours: 0,
      otAmount: 0,
      overtimeHoursFormatted: '00h 00m',
    };
  }

  // COMPLETE 1-HOUR BLOCKS ONLY: FLOOR((Total Work Minutes - 480) / 60)
  const otHours = Math.max(0, Math.floor((totalWorkMinutes - NORMAL_WORK_MINUTES) / 60));
  const otAmount = otHours * rate;
  const formattedHours = String(otHours).padStart(2, '0');
  const overtimeHoursFormatted = `${formattedHours}h 00m`;

  return {
    otHours,
    otAmount,
    overtimeHoursFormatted,
  };
}

/**
 * Calculates overtime from a work duration string like "09h 13m".
 */
export function calculateOvertimeFromWorkHours(
  workHoursStr: string,
  rate: number = DEFAULT_OVERTIME_RATE
) {
  const totalMinutes = parseDurationToMinutes(workHoursStr);
  return calculateOvertimeFromMinutes(totalMinutes, rate);
}

/**
 * Formats total minutes to standard "08h 15m" representation.
 */
export function formatMinutesToHoursMinutes(totalMinutes: number): string {
  const hours = Math.floor(Math.max(0, totalMinutes) / 60);
  const minutes = Math.max(0, totalMinutes) % 60;
  return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
}

/**
 * Computes difference between two 12-hour or 24-hour time strings in minutes.
 */
export function computeMinutesBetweenTimes(inTime: string, outTime: string): number {
  if (!inTime || !outTime || inTime === '--:--' || outTime === '--:--') return 0;

  const parseTime = (str: string) => {
    const trimmed = str.trim().toUpperCase();
    const isPM = trimmed.includes('PM');
    const isAM = trimmed.includes('AM');
    const cleanStr = trimmed.replace(/[^\d:]/g, '');
    const [hStr, mStr] = cleanStr.split(':');
    let hours = parseInt(hStr || '0', 10);
    const minutes = parseInt(mStr || '0', 10);

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const inMins = parseTime(inTime);
  let outMins = parseTime(outTime);
  if (outMins < inMins) {
    // Crosses midnight
    outMins += 24 * 60;
  }
  return Math.max(0, outMins - inMins);
}

/**
 * Enforces the complete 1-hour block overtime rule across an AttendanceRecord.
 * Updates workHours, regularHours, overtimeHours, and otAmount according to the exact rule.
 */
export function applyOvertimeRuleToRecord(record: AttendanceRecord): AttendanceRecord {
  const totalMinutes = parseDurationToMinutes(record.workHours);
  const rate = record.otRate || DEFAULT_OVERTIME_RATE;
  const { otHours, otAmount, overtimeHoursFormatted } = calculateOvertimeFromMinutes(totalMinutes, rate);

  const regularMinutes = Math.min(totalMinutes, NORMAL_WORK_MINUTES);
  const regularHours = formatMinutesToHoursMinutes(regularMinutes);

  return {
    ...record,
    regularHours,
    overtimeHours: overtimeHoursFormatted,
    otRate: rate,
    otAmount,
  };
}

/**
 * Formats seconds into HH:MM:SS (e.g. 05:42:18, 09:05:32)
 */
export function formatSecondsToHMS(totalSeconds: number): string {
  const nonNegative = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(nonNegative / 3600);
  const minutes = Math.floor((nonNegative % 3600) / 60);
  const seconds = nonNegative % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculates live worked duration, overtime duration, and overtime pay from an IN timestamp.
 * Normal work duration is exactly 8 hours (28,800 seconds).
 * Complete 1-hour block overtime rule applies to pay:
 * OT completed hours = FLOOR((total worked minutes - 480) / 60)
 * OT Pay = OT completed hours * rate
 */
export function getElapsedWorkTime(
  inTimestamp: number,
  nowTimestamp: number = Date.now(),
  rate: number = DEFAULT_OVERTIME_RATE
): {
  elapsedSeconds: number;
  formattedWorked: string;
  isOvertime: boolean;
  overtimeSeconds: number;
  formattedOvertime: string;
  otCompletedHours: number;
  otPay: number;
  totalWorkedMinutes: number;
} {
  // Sanity check: If inTimestamp is in the future compared to nowTimestamp (e.g. UTC+5:30 offset issue), correct it
  let validInTs = inTimestamp;
  if (validInTs > nowTimestamp + 30000) {
    if (validInTs - nowTimestamp >= 19000000 && validInTs - nowTimestamp <= 20500000) {
      validInTs -= 19800000;
    } else {
      validInTs = nowTimestamp;
    }
  }

  const elapsedSeconds = Math.max(0, Math.floor((nowTimestamp - validInTs) / 1000));
  const formattedWorked = formatSecondsToHMS(elapsedSeconds);
  const totalWorkedMinutes = Math.floor(elapsedSeconds / 60);

  const NORMAL_WORK_SECONDS = 8 * 3600; // 28,800 seconds
  const isOvertime = elapsedSeconds >= NORMAL_WORK_SECONDS;
  const overtimeSeconds = isOvertime ? elapsedSeconds - NORMAL_WORK_SECONDS : 0;
  const formattedOvertime = formatSecondsToHMS(overtimeSeconds);

  // Complete 1-hour block rule for pay
  const { otHours, otAmount } = calculateOvertimeFromMinutes(totalWorkedMinutes, rate);

  return {
    elapsedSeconds,
    formattedWorked,
    isOvertime,
    overtimeSeconds,
    formattedOvertime,
    otCompletedHours: otHours,
    otPay: otAmount,
    totalWorkedMinutes,
  };
}

/**
 * Calculates the official shift start timestamp for an active shift.
 * Counts worked time from the shift's official start time (e.g. "14:00" for Shift B) rather than 00:00:00 at punch-in.
 * 
 * @param shiftStartTime Shift start time string, e.g. "14:00", "06:00", "22:00"
 * @param nowTimestamp Current timestamp in milliseconds (defaults to Date.now())
 * @param actualInTimestamp Optional actual check-in timestamp
 */
export function getShiftStartTimestamp(
  shiftStartTime?: string,
  nowTimestamp: number = Date.now(),
  actualInTimestamp?: number
): number {
  if (!shiftStartTime || shiftStartTime === '--:--') {
    return actualInTimestamp || nowTimestamp;
  }

  const now = new Date(nowTimestamp);
  const clean = shiftStartTime.trim().replace(/[^\d:]/g, '');
  const parts = clean.split(':');
  let shiftHours = parseInt(parts[0] || '0', 10);
  const shiftMinutes = parseInt(parts[1] || '0', 10);

  // Handle 12-hour AM/PM if present in string
  const upper = shiftStartTime.toUpperCase();
  if (upper.includes('PM') && shiftHours < 12) shiftHours += 12;
  if (upper.includes('AM') && shiftHours === 12) shiftHours = 0;

  // Construct shift start date on today's calendar date
  const shiftDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), shiftHours, shiftMinutes, 0, 0);

  // Overnight shift handling:
  // If shiftDate is more than 2 hours in the future (e.g. night shift starts at 22:00, but current time is 04:00 AM next day)
  if (shiftDate.getTime() - nowTimestamp > 2 * 3600 * 1000) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }

  return shiftDate.getTime();
}

/**
 * Reconstructs a timestamp from an attendance record's date and inTime strings,
 * with awareness of overnight shifts and flexible date/time formats.
 */
export function parseDateTimeToTimestamp(dateStr?: string, timeStr?: string): number {
  if (!timeStr || timeStr === '--:--') return Date.now();

  const now = new Date();
  let baseDate = new Date();

  // Try parsing dateStr if provided
  if (dateStr) {
    const trimmedDate = dateStr.trim();
    // Check if DD/MM/YYYY
    const ddmmyyyy = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
      const day = parseInt(ddmmyyyy[1], 10);
      const month = parseInt(ddmmyyyy[2], 10) - 1;
      const year = parseInt(ddmmyyyy[3], 10);
      baseDate = new Date(year, month, day);
    } else {
      // Check if YYYY-MM-DD
      const yyyymmdd = trimmedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (yyyymmdd) {
        const year = parseInt(yyyymmdd[1], 10);
        const month = parseInt(yyyymmdd[2], 10) - 1;
        const day = parseInt(yyyymmdd[3], 10);
        baseDate = new Date(year, month, day);
      } else {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      }
    }
  }

  // Parse timeStr like "08:02:15 AM", "08:02 AM", "14:00", "22:00:00"
  const trimmed = timeStr.trim().toUpperCase();
  const isPM = trimmed.includes('PM');
  const isAM = trimmed.includes('AM');
  const clean = trimmed.replace(/[^\d:]/g, '');
  const parts = clean.split(':');
  let hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = parseInt(parts[2] || '0', 10);

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  baseDate.setHours(hours, minutes, seconds, 0);

  // Overnight shift handling:
  // If baseDate is in the future compared to now (e.g. 10:00 PM on overnight shift and current time is 5:00 AM next day)
  if (baseDate.getTime() > now.getTime()) {
    baseDate.setDate(baseDate.getDate() - 1);
  }

  return baseDate.getTime();
}

/**
 * Converts 24-hour time string like "14:00", "06:00", "22:00" to 12-hour AM/PM format like "02:00 PM", "06:00 AM", "10:00 PM".
 * If already in 12-hour format or invalid, returns cleanly.
 */
export function formatTo12Hour(timeStr?: string): string {
  if (!timeStr || timeStr === '--:--') return '--:--';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1].replace(/[^\d]/g, '').padStart(2, '0');
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}
