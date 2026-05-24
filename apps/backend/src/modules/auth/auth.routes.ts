import { Router } from 'express';
import { loginHandler } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';

const authRouter = Router();

authRouter.post('/login', validate(loginSchema), loginHandler);

export default authRouter;
