import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerAttendanceSchema } from './attendance.schema';
import { registerAttendance, getHistory } from './attendance.controller';

const attendanceRouter = Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { status: 'error', message: 'Demasiadas solicitudes. Intente nuevamente en un minuto.' },
});

attendanceRouter.post(
  '/register',
  registerLimiter,
  validate(registerAttendanceSchema),
  registerAttendance,
);

attendanceRouter.get('/history', authMiddleware, adminMiddleware, getHistory);

export default attendanceRouter;
