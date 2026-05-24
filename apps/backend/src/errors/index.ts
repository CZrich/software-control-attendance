import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación',
      errors: (err as any).errors,
    });
  }

  console.error('Error no controlado:', err);
  return res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
};
