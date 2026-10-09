import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middleware/requestValidator';
import { requireAuth } from '../../middleware/auth';
import { RegisterUserSchema, LoginUserSchema } from '@foodbridge/shared';

const router = Router();

router.post('/register', validateBody(RegisterUserSchema), AuthController.register);
router.post('/login', validateBody(LoginUserSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.get('/me', requireAuth, AuthController.getMe);
router.post('/logout', requireAuth, AuthController.logout);

export const authRoutes = router;
