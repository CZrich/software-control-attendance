import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authMiddleware, roleGuard } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { registerAttendanceSchema, updateRecordSchema } from './attendance.schema';
import { registerAttendance, getHistory, updateRecord } from './attendance.controller';

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

attendanceRouter.get('/history', authMiddleware, roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']), getHistory);

attendanceRouter.put(
  '/records/:id',
  authMiddleware,
  roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']),
  validate(updateRecordSchema),
  updateRecord,
);

export default attendanceRouter;
