import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { AppError } from '../../errors';

export const getSchedules = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedules = await prisma.schedule.findMany();
    res.status(200).json({ status: 'success', data: schedules });
  } catch (err) {
    next(err);
  }
};

export const createSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedule = await prisma.schedule.create({ data: req.body });
    res.status(201).json({ status: 'success', data: schedule });
  } catch (err) {
    next(err);
  }
};

export const updateSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.status(200).json({ status: 'success', data: schedule });
  } catch (err) {
    next(err);
  }
};

export const deleteSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const usersCount = await prisma.user.count({
      where: { scheduleId: req.params.id }
    });
    
    if (usersCount > 0) {
      throw new AppError('No se puede eliminar un turno que tiene empleados asignados.', 400);
    }

    await prisma.schedule.delete({ where: { id: req.params.id } });
    res.status(200).json({ status: 'success', message: 'Turno eliminado' });
  } catch (err) {
    next(err);
  }
};
