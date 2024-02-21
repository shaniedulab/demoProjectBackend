import { Router } from 'express';
import AuthController from './auth.controller';
import { authenticateJwt } from '../../utils/auth.util';

/** Initializing Router */
const router = Router();

router.post('/login', AuthController.login);

router.post('/register', AuthController.register);

router.post('/forgetPassword', AuthController.forgetPassword);

router.post('/setPassword/:token', AuthController.setPassword);

export default router;