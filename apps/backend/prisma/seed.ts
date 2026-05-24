import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@attendance.com';
  const adminDni = '12345678';

  const existingAdmin = await prisma.user.findFirst({
    where: { OR: [{ email: adminEmail }, { dni: adminDni }] },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        dni: adminDni,
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log('Admin creado: admin@attendance.com / admin123');
  } else {
    console.log('Admin ya existe, saltando seed.');
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
