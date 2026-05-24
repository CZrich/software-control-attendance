export interface User {
  id: string;
  dni: string;
  email: string | null;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  isActive: boolean;
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
