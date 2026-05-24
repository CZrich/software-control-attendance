import { AttendanceType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors';
import { config } from '../../config';

export class AttendanceService {
  async register(dni: string, device?: string, ip?: string) {
    const user = await prisma.user.findUnique({
      where: { dni },
      include: { schedule: true }
    });
    
    if (!user) throw new AppError('DNI no registrado en el sistema', 404);
    if (!user.isActive) throw new AppError('Usuario inactivo. Contacte al administrador.', 400);

    const now = new Date();
    // Helper to get YYYY-MM-DD
    const dateStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];

    const record = await prisma.attendanceRecord.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: dateStr,
        }
      }
    });

    let nextType: AttendanceType;

    if (!record) {
      // First mark -> CHECK_IN
      nextType = AttendanceType.CHECK_IN;
      let isLate = false;
      let minutesLate = 0;

      if (user.schedule) {
        const [schHour, schMin] = user.schedule.checkInTime.split(':').map(Number);
        const schTimeInMinutes = schHour * 60 + schMin;
        const actualTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        
        const limitTime = schTimeInMinutes + user.schedule.toleranceMinutes;
        
        if (actualTimeInMinutes > limitTime) {
          isLate = true;
          minutesLate = actualTimeInMinutes - schTimeInMinutes;
        }
      }

      await prisma.attendanceRecord.create({
        data: {
          userId: user.id,
          date: dateStr,
          checkIn: now,
          isLate,
          minutesLate,
        }
      });

    } else if (!record.checkOut) {
      // Second mark -> CHECK_OUT
      nextType = AttendanceType.CHECK_OUT;
      
      const diffMs = now.getTime() - new Date(record.checkIn).getTime();
      const diffMinutes = diffMs / (1000 * 60);
      
      let errorMessage = 'Detectamos una posible marcación errónea.';
      let isEarlyCheckout = false;

      // 1. Prevent checkout if less than 30 mins have passed
      if (diffMinutes < 30) {
        isEarlyCheckout = true;
      }

      // 2. Prevent checkout if it's before the scheduled checkout time
      if (user.schedule) {
        const [schOutHour, schOutMin] = user.schedule.checkOutTime.split(':').map(Number);
        const schOutTimeInMinutes = schOutHour * 60 + schOutMin;
        const actualTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        if (actualTimeInMinutes < schOutTimeInMinutes) {
          isEarlyCheckout = true;
          errorMessage = `Su hora de salida es a las ${user.schedule.checkOutTime}.`;
        }
      }

      if (isEarlyCheckout) {
        throw new AppError(
          `${errorMessage} Acérquese a RR.HH o al administrador para justificar su salida.`,
          400
        );
      }

      const workedHours = diffMinutes / 60;

      await prisma.attendanceRecord.update({
        where: { id: record.id },
        data: {
          checkOut: now,
          workedHours,
        }
      });
    } else {
      // Third mark or more -> Error
      throw new AppError('Ya completó su marcación por el día de hoy.', 400);
    }

    // Always create the raw event
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
      where.date = {};
      // For string based YYYY-MM-DD
      if (filters.startDate) where.date.gte = filters.startDate;
      if (filters.endDate) where.date.lte = filters.endDate;
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

    return prisma.attendanceRecord.findMany({
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
      orderBy: { date: 'desc' },
    });
  }

  async updateRecord(id: string, data: any, adminId: string) {
    const record = await prisma.attendanceRecord.findUnique({ where: { id } });
    if (!record) throw new AppError('Registro no encontrado', 404);

    const updateData: any = {
      ...data,
      correctedBy: adminId,
    };

    if (data.checkIn) updateData.checkIn = new Date(data.checkIn);
    if (data.checkOut) updateData.checkOut = new Date(data.checkOut);

    return prisma.attendanceRecord.update({
      where: { id },
      data: updateData,
    });
  }
}
