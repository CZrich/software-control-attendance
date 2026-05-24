import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = 'superadmin@attendance.com';
  const superAdminDni = '00000000';

  // Create default schedule
  let defaultSchedule = await prisma.schedule.findFirst({
    where: { name: 'Turno Mañana' }
  });

  if (!defaultSchedule) {
    defaultSchedule = await prisma.schedule.create({
      data: {
        name: 'Turno Mañana',
        checkInTime: '08:00',
        checkOutTime: '17:00',
        toleranceMinutes: 10,
      }
    });
    console.log('Turno por defecto creado.');
  }

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { OR: [{ email: superAdminEmail }, { dni: superAdminDni }] },
  });

  if (!existingSuperAdmin) {
    const hashedPassword = await bcrypt.hash('superadmin123', 10);
    await prisma.user.create({
      data: {
        dni: superAdminDni,
        email: superAdminEmail,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
    });
    console.log('Super Admin creado: superadmin@attendance.com / superadmin123');
  } else {
    console.log('Super Admin ya existe, saltando seed de superadmin.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
