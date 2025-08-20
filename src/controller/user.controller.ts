'use-strict';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import UserService from '@service/user.service';

class UserController {
  //[assign role]
  static async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ lấy đúng id dạng number
      const userId = Number(req.params.id);
      if (!userId) return res.status(400).json({ message: 'Thiếu user id' });

      const { roleName, roleId } = req.body ?? {};
      if (!roleName && !roleId) {
        return res.status(400).json({ message: 'Thiếu roleName hoặc roleId' });
      }

      // ✅ gọi service với object đúng schema
      const assignedName = await UserService.assignRole({
        userId,
        roleId: roleId ? Number(roleId) : undefined,
        roleName: roleName ? String(roleName) : undefined,
      });

      return res.json({
        message: 'Đã gán role cho user',
        userId,
        role: assignedName,
      });
    } catch (err) {
      next(err);
    }
  }

  // [POST] /admin/users  { name,email,role_id, sendInvite? }
  static async createUserByAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const {
        name,
        email,
        role_id,
        roleId,
        sendInvite,
        phoneNumber,
        birthDate,
        initialPassword,
        createdBy,
      } = (req.body ?? {}) as any;

      const roleNum =
        role_id != null
          ? Number(role_id)
          : roleId != null
            ? Number(roleId)
            : NaN;
      if (!name || !email || !roleNum) {
        return res
          .status(400)
          .json({ message: 'Thiếu name, email hoặc role_id/roleId' });
      }

      const result = await UserService.adminCreateUser({
        name: String(name),
        email: String(email),
        role_id: Number(roleNum),
        sendInvite: sendInvite === undefined ? true : Boolean(sendInvite),
        phoneNumber: phoneNumber ?? undefined,
        birthDate: birthDate ?? undefined,
        initialPassword: initialPassword ?? undefined,
        createdBy: createdBy != null ? Number(createdBy) : undefined,
      });

      // 201 khi tạo user
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
  // [GET] /admin/users/:id
  static async getUserForAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'Thiếu id' });

      const data = await UserService.getUserForAdmin(id);

      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // [GET] /admin/users?q=&status=&page=&pageSize=
  static async listUsersForAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { q, status, page, pageSize } = req.query as any;
      const data = await UserService.listUsersForAdmin({
        q,
        status,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  // [POST] /auth/activate { token, newPassword }
  static async activateByInvite(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: 'Thiếu token hoặc newPassword' });
      }
      const ok = await UserService.activateByInvite(
        String(token),
        String(newPassword)
      );
      return res.json(ok);
    } catch (err) {
      next(err);
    }
  }

  // [POST] /users/:id/resend-invite  (gửi lại email kích hoạt nếu chưa verified)
  static async resendInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!id) return res.status(400).json({ message: 'Thiếu id' });

      const result = await UserService.resendInvite(id);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // Giữ tên cũ để tương thích: gọi sang resendInvite
  // [POST] /users/:id/reset-password  (trước đây dùng cho “trigger email reset”)
  static async adminTriggerReset(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return UserController.resendInvite(req, res, next);
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      // tuỳ middleware của bạn: có thể là req.userId hoặc req.user.id
      const uid = Number((req as any).userId ?? (req as any).user?.id);
      if (!uid) return res.status(401).json({ message: 'Unauthenticated' });

      const data = await UserService.getSelf(uid);
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction) {
    try {
      const uid = Number((req as any).userId ?? (req as any).user?.id);
      if (!uid) return res.status(401).json({ message: 'Unauthenticated' });

      const { name, email, phoneNumber, address, birthDate } = req.body || {};
      const data = await UserService.updateSelf(uid, {
        name,
        email,
        phoneNumber,
        address,
        birthDate,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
