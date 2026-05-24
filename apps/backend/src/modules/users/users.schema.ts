import { z } from 'zod';

export const createUserSchema = z.object({
  dni: z.string().min(8, 'DNI debe tener exactamente 8 caracteres').max(8, 'DNI debe tener exactamente 8 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres').optional().nullable(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE']).default('EMPLOYEE'),
  isActive: z.boolean().default(true),
  scheduleId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  dni: z.string().length(8).optional(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).optional().nullable(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional(),
  scheduleId: z.string().optional().nullable(),
});
