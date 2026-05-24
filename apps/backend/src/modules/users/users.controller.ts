import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { UsersService } from './users.service';

const usersService = new UsersService();

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await usersService.getAll();
    res.status(200).json({ status: 'success', data: users });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.getById(req.params.id);
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await usersService.update(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await usersService.delete(req.params.id);
    res.status(200).json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
