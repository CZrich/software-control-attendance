import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors';
import { config } from '../../config';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new AppError('Credenciales inválidas', 401);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError('Credenciales inválidas', 401);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '8h' },
    );

    return {
      token,
      user: {
        id: user.id,
        dni: user.dni,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}
