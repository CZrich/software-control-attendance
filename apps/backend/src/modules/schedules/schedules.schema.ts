import { z } from 'zod';

export const scheduleSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  checkInTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM requerido'),
  checkOutTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM requerido'),
  toleranceMinutes: z.number().int().min(0, 'Debe ser mayor o igual a 0'),
});
