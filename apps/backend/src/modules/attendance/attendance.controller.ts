import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { AttendanceService } from './attendance.service';

const attendanceService = new AttendanceService();

export const registerAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { dni } = req.body;
    const device = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.socket.remoteAddress;
    const result = await attendanceService.register(dni, device, ip);
    res.status(201).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const getHistory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate, search } = req.query as any;
    const result = await attendanceService.getHistory({
      startDate,
      endDate,
      search,
    });
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
