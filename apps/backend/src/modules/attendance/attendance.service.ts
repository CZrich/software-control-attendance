import { AttendanceType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors';
import { config } from '../../config';

export class AttendanceService {
  async register(dni: string, device?: string, ip?: string) {
    const user = await prisma.user.findUnique({ where: { dni } });
    if (!user) throw new AppError('DNI no registrado en el sistema', 404);
    if (!user.isActive) throw new AppError('Usuario inactivo. Contacte al administrador.', 400);

    const lastAttendance = await prisma.attendance.findFirst({
      where: { userId: user.id },
      orderBy: { timestamp: 'desc' },
    });

    if (lastAttendance) {
      const diffMs = Date.now() - new Date(lastAttendance.timestamp).getTime();
      const diffSecs = diffMs / 1000;
      if (diffSecs < config.attendanceCooldownSeconds) {
        const wait = Math.ceil(config.attendanceCooldownSeconds - diffSecs);
        throw new AppError(
          `Doble marcación evitada. Espere ${wait} segundos para marcar nuevamente.`,
          400,
        );
      }
    }

    const nextType =
      lastAttendance && lastAttendance.type === AttendanceType.CHECK_IN
        ? AttendanceType.CHECK_OUT
        : AttendanceType.CHECK_IN;

    const attendance = await prisma.attendance.create({
      data: {
        userId: user.id,
        type: nextType,
        device: device || null,
        ipAddress: ip || null,
      },
      include: {
        user: {
          select: {
            dni: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return attendance;
  }

  async getHistory(filters: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = new Date(filters.startDate);
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    if (filters.search) {
      where.user = {
        OR: [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { dni: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    return prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            dni: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }
}
