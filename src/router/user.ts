import UserController from '@controller/user.controller';
import * as express from 'express';
const router = express.Router();

// Danh sách & chi tiết
router.get('/', UserController.listUsersForAdmin);
router.get('/:id', UserController.getUserForAdmin);

// Tạo user (mời qua mail hoặc trả tempPassword 1 lần)
router.post('/', UserController.createUserByAdmin);

// Gán role
router.post('/:id/role', UserController.assignRole);

router.post('/:id/resend-invite', UserController.resendInvite);

router.post('/:id/reset-password', UserController.adminTriggerReset);

export default router;
