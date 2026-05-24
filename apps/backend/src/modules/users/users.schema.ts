import { z } from 'zod';

export const createUserSchema = z.object({
  dni: z.string().min(6, 'DNI debe tener al menos 6 caracteres').max(12, 'DNI demasiado largo'),
  email: z.string().email('Email inválido').optional().nullable(),
  password: z.string().min(6, 'Contraseña debe tener al menos 6 caracteres').optional().nullable(),
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  role: z.enum(['ADMIN', 'EMPLOYEE']).default('EMPLOYEE'),
  isActive: z.boolean().default(true),
});

export const updateUserSchema = z.object({
  dni: z.string().min(6).max(12).optional(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).optional().nullable(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'EMPLOYEE']).optional(),
  isActive: z.boolean().optional(),
});
