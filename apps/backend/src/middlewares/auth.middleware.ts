import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors';
import { config } from '../config';

export interface AuthPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.split(' ')[1];
};

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractToken(req);
  if (!token) throw new AppError('Acceso denegado. Token no provisto.', 401);
  try {
    req.user = jwt.verify(token, config.jwtSecret) as AuthPayload;
    next();
  } catch {
    throw new AppError('Token inválido o expirado.', 401);
  }
};

export const roleGuard = (allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      throw new AppError('Permiso denegado. No tienes el rol necesario.', 403);
    }
    next();
  };
};
