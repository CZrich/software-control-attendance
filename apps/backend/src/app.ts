import express from 'express';
import cors from 'cors';
import { errorHandler } from './errors';
import authRouter from './modules/auth/auth.routes';
import usersRouter from './modules/users/users.routes';
import attendanceRouter from './modules/attendance/attendance.routes';
import schedulesRouter from './modules/schedules/schedules.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/schedules', schedulesRouter);

app.use(errorHandler);

export default app;
