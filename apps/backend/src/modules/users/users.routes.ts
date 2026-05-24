import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema } from './users.schema';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from './users.controller';

const usersRouter = Router();

usersRouter.use(authMiddleware, adminMiddleware);

usersRouter.get('/', getAllUsers);
usersRouter.get('/:id', getUserById);
usersRouter.post('/', validate(createUserSchema), createUser);
usersRouter.put('/:id', validate(updateUserSchema), updateUser);
usersRouter.delete('/:id', deleteUser);

export default usersRouter;
