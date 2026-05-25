export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface Schedule {
  id: string;
  name: string;
  checkInTime: string;
  checkOutTime: string;
  toleranceMinutes: number;
  entryWindowBeforeMinutes: number;
  entryWindowAfterMinutes: number;
}

export interface User {
  id: string;
  dni: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  scheduleId: string | null;
  schedule?: Schedule | null;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  isLate: boolean;
  minutesLate: number;
  workedHours: number | null;
  justifiedAbsence: boolean;
  justificationReason: string | null;
  correctedBy: string | null;
  correctionReason: string | null;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  type: 'CHECK_IN' | 'CHECK_OUT';
  timestamp: string;
  device: string | null;
  ipAddress: string | null;
  user: {
    dni: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LoginResponse {
  status: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
