import { Router } from 'express';
import { authMiddleware, roleGuard } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { scheduleSchema } from './schedules.schema';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from './schedules.controller';

const schedulesRouter = Router();

schedulesRouter.get('/', authMiddleware, roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']), getSchedules);
schedulesRouter.post('/', authMiddleware, roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']), validate(scheduleSchema), createSchedule);
schedulesRouter.put('/:id', authMiddleware, roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']), validate(scheduleSchema), updateSchedule);
schedulesRouter.delete('/:id', authMiddleware, roleGuard(['SUPER_ADMIN', 'ADMIN', 'HR']), deleteSchedule);

export default schedulesRouter;
