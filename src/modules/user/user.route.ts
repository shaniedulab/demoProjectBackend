import { Router } from 'express';
import UserController from './user.controller';
import { authenticateJwt } from '../../utils/auth.util';

const router = Router();

/**
 * @GET
 * @route /api/users
 * @description Get all users
*/
router.get('/getUser',authenticateJwt, UserController.getUser);

/**
 * @GET 
 * @route /api/users/my-info
 * @description Get users info
*/
router.get('/getUsers', UserController.getUsers);

router.post('/updatePassword', authenticateJwt, UserController.updatePassword);

router.post('/updateMe', authenticateJwt, UserController.updateMe);

export default router;
