// src/routes/admin.users.route.ts
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

// Gửi lại invite / giữ tương thích
router.post('/:id/resend-invite', UserController.resendInvite);
router.post('/:id/reset-password', UserController.adminTriggerReset);

// ✅ Sửa thông tin user (admin)
router.patch('/:id', UserController.adminUpdateUser);

// ✅ Đổi trạng thái isVerified nhanh
router.patch('/:id/verify', UserController.setVerified);

export default router;
