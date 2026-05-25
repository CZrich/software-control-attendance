import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors';

export class UsersService {
  async getAll() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dni: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        scheduleId: true,
        schedule: {
          select: { id: true, name: true, checkInTime: true, checkOutTime: true, toleranceMinutes: true, entryWindowBeforeMinutes: true, entryWindowAfterMinutes: true },
        },
        createdAt: true,
      },
    });
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        dni: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        scheduleId: true,
        schedule: {
          select: { id: true, name: true, checkInTime: true, checkOutTime: true, toleranceMinutes: true, entryWindowBeforeMinutes: true, entryWindowAfterMinutes: true },
        },
        createdAt: true,
      },
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  }

  async create(data: {
    dni: string;
    email?: string | null;
    password?: string | null;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'EMPLOYEE';
    isActive: boolean;
    scheduleId?: string | null;
  }) {
    const existingDni = await prisma.user.findUnique({ where: { dni: data.dni } });
    if (existingDni) throw new AppError('El DNI ya está registrado', 400);

    if (data.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new AppError('El email ya está registrado', 400);
    }

    const createData: any = {
      dni: data.dni,
      email: data.email || null,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isActive: data.isActive,
      scheduleId: data.scheduleId || null,
    };

    if (data.password) {
      createData.password = await bcrypt.hash(data.password, 10);
    }

    return prisma.user.create({
      data: createData,
      select: {
        id: true,
        dni: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async update(
    id: string,
    data: {
      dni?: string;
      email?: string | null;
      password?: string | null;
      firstName?: string;
      lastName?: string;
      role?: 'ADMIN' | 'EMPLOYEE';
      isActive?: boolean;
      scheduleId?: string | null;
    },
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (data.dni && data.dni !== user.dni) {
      const existingDni = await prisma.user.findUnique({ where: { dni: data.dni } });
      if (existingDni) throw new AppError('El DNI ya está registrado', 400);
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new AppError('El email ya está registrado', 400);
    }

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else if (data.password === null) {
      updateData.password = null;
    } else {
      delete updateData.password;
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        dni: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('Usuario no encontrado', 404);
    await prisma.user.delete({ where: { id } });
    return { message: 'Usuario eliminado correctamente' };
  }
}
