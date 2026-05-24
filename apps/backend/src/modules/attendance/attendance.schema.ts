import { z } from 'zod';

export const registerAttendanceSchema = z.object({
  dni: z.string().min(1, 'DNI requerido'),
});

export const historyQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
});

export const updateRecordSchema = z.object({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  justifiedAbsence: z.boolean().optional(),
  justificationReason: z.string().optional(),
  correctionReason: z.string().optional(),
});
