import * as express from 'express';
const router = express.Router();
import { AuthController } from '@controller';
import { validatorLogin } from '@validation';
import {
  validatorChangePassword,
  validatorResetPassword,
} from '@validation/auth.validation';
import authMiddleware from '@middleware/auth';
import { UserController } from '@controller';

router.post('/login', validatorLogin, AuthController.login);
router.post('/sendVerify', AuthController.sendVerify);
router.get('/verify', AuthController.verify);
router.post('/logout', AuthController.logout);
router.post('/forgotPassword', AuthController.forgotPassword);
router.patch(
  '/resetPassword',
  validatorResetPassword,
  AuthController.resetPassword
);
router.patch(
  '/changePassword',
  validatorChangePassword,
  authMiddleware,
  AuthController.changePassword
);
router.post('/activate', UserController.activateByInvite);

export default router;
