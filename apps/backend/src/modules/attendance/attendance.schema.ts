import { z } from 'zod';

export const registerAttendanceSchema = z.object({
  dni: z.string().min(1, 'DNI requerido'),
});

export const historyQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});
