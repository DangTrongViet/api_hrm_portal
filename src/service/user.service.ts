// src/service/user.service.ts
'use strict';

import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from '@models/user.model';
import { Role } from '@models/roles.model';
import { Permission } from '@models/permissions.model';
import { NotFoundError } from '@helper';
import { sendMail, buildInviteEmailHtml } from '../helper/sendMail'; // ✅ dùng module mail mới

type CreateUserInput = {
  name: string;
  email: string;
  role_id: number;
  sendInvite?: boolean;
  phoneNumber?: string;
  birthDate?: string | Date | null;
  createdBy?: number | null;
  initialPassword?: string; // (tuỳ chọn) admin tự đặt
};

type CreateUserResult =
  | { id: number; email: string; sent: true }
  | { id: number; email: string; tempPassword: string }
  | { id: number; email: string; sent: false; error?: string };

type AssignRoleInput = { userId: number; roleId?: number; roleName?: string };

export default class UserService {
  /** Gán role cho user, trả về role name */
  static async assignRole(input: AssignRoleInput) {
    const { userId, roleId, roleName } = input;

    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User không tồn tại');

    let role: Role | null = null;
    if (roleId) {
      role = await Role.findByPk(roleId);
    } else if (roleName) {
      role = await Role.findOne({ where: { name: roleName } });
    }
    if (!role) throw new NotFoundError('Role không tồn tại');

    user.role_id = role.id;
    await user.save();

    return role.name;
  }

  /** Admin tạo user: mời qua email (invite) hoặc trả mật khẩu tạm (show 1 lần) */
  static async adminCreateUser(
    input: CreateUserInput
  ): Promise<CreateUserResult> {
    const {
      name,
      email,
      role_id,
      sendInvite = true,
      phoneNumber,
      birthDate,
      createdBy,
      initialPassword,
    } = input;

    // 1) Chuẩn hoá & validate
    const emailNorm = String(email).trim().toLowerCase();
    const nameNorm = String(name).trim();

    if (!emailNorm || !/^\S+@\S+\.\S+$/.test(emailNorm)) {
      const err: any = new Error('Email không hợp lệ');
      err.status = 400;
      throw err;
    }
    if (!nameNorm || nameNorm.length < 2) {
      const err: any = new Error('Tên tối thiểu 2 ký tự');
      err.status = 400;
      throw err;
    }

    const role = await Role.findByPk(role_id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    let bd: Date | null = null;
    if (birthDate) {
      const dt = new Date(birthDate);
      if (Number.isNaN(dt.getTime())) {
        const err: any = new Error('birthDate không hợp lệ');
        err.status = 400;
        throw err;
      }
      bd = dt;
    }

    // 2) Mật khẩu tạm (được hash ở hooks)
    const tempPassword =
      (initialPassword && initialPassword.trim()) ||
      crypto.randomBytes(8).toString('base64url');

    // 3) Chuẩn bị invite
    const minutes = Number(process.env.INVITE_EXPIRES_MINUTES || 60);
    let inviteToken: string | null = null;
    let inviteExpires: Date | null = null;
    const isVerified = !sendInvite; // nếu mời qua email ⇒ chưa verified

    if (sendInvite) {
      inviteToken = crypto.randomUUID();
      inviteExpires = new Date(Date.now() + minutes * 60 * 1000);
    }

    const t = await User.sequelize!.transaction();
    try {
      // 4) Tạo user
      const user = await User.create(
        {
          name: nameNorm,
          email: emailNorm,
          role_id,
          password: tempPassword,
          phoneNumber: phoneNumber ?? null,
          birthDate: bd,
          isVerified,
          mustChangePassword: true,
          inviteToken,
          inviteExpires,
          createdBy: createdBy ?? null,
        },
        { transaction: t }
      );

      await t.commit();

      // 5) Gửi email mời (nếu cần). Không rollback nếu email lỗi; cho phép resend.
      if (sendInvite && inviteToken) {
        try {
          const origin = process.env.APP_ORIGIN || 'http://localhost:5173';
          const inviteLink = `${origin}/activate?token=${encodeURIComponent(inviteToken)}`;
          const html = buildInviteEmailHtml(user.name, inviteLink);
          await sendMail(user.email, 'Kích hoạt tài khoản HRM', html);
          return { id: user.id, email: user.email, sent: true };
        } catch (e: any) {
          return {
            id: user.id,
            email: user.email,
            sent: false,
            error: 'Không gửi được email mời. Hãy thử gửi lại sau.',
          };
        }
      }

      // 6) Không mời qua email: trả mật khẩu tạm 1 lần
      return { id: user.id, email: user.email, tempPassword };
    } catch (e: any) {
      await t.rollback();
      if (e?.name === 'SequelizeUniqueConstraintError') {
        const err: any = new Error('Email đã tồn tại');
        err.status = 409;
        throw err;
      }
      throw e;
    }
  }

  /** Lấy thông tin 1 user cho admin (ẩn password/otp, kèm role + permissionNames) */
  static async getUserForAdmin(id: number) {
    const user = await User.findByPk(id, {
      attributes: [
        'id',
        'name',
        'email',
        'birthDate',
        'status',
        'phoneNumber',
        'address',
        'isVerified',
        'mustChangePassword',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'department'],
          include: [
            {
              model: Permission,
              attributes: ['name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) throw new NotFoundError('User không tồn tại');

    const role = user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          department: (user.role as any).department ?? null,
        }
      : null;

    const permissionNames = Array.isArray((user.role as any)?.permissions)
      ? (user.role as any).permissions.map((p: Permission) => p.name)
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      status: user.status,
      phoneNumber: user.phoneNumber,
      address: user.address,
      isVerified: user.isVerified,
      mustChangePassword: (user as any).mustChangePassword,
      role,
      permissionNames,
      lastLoginAt: (user as any).lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /** Danh sách user cho admin (search + filter + paginate) */
  static async listUsersForAdmin(params: {
    q?: string;
    status?: 'active' | 'inactive';
    page?: number;
    pageSize?: number;
    roleId?: number;
  }) {
    const { q, status, page = 1, pageSize = 20, roleId } = params;

    const where: any = {};
    if (status) where.status = status;
    if (roleId) where.role_id = roleId;
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { phoneNumber: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await User.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id',
        'name',
        'email',
        'status',
        'phoneNumber',
        'isVerified',
        'createdAt',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'department'],
        },
      ],
    });

    const data = rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      status: u.status,
      phoneNumber: u.phoneNumber,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      role: u.role
        ? {
            id: u.role.id,
            name: u.role.name,
            department: (u.role as any).department ?? null,
          }
        : null,
    }));

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /** Kích hoạt tài khoản bằng invite token + đặt mật khẩu mới */
  static async activateByInvite(token: string, newPassword: string) {
    if (!token || !newPassword) {
      const err: any = new Error('Thiếu token hoặc mật khẩu mới');
      err.status = 400;
      throw err;
    }
    if (newPassword.length < 8) {
      const err: any = new Error('Mật khẩu mới tối thiểu 8 ký tự');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({
      where: {
        inviteToken: token,
        inviteExpires: { [Op.gt]: new Date() },
        isVerified: false,
      },
    });

    if (!user) {
      const err: any = new Error('Token không hợp lệ hoặc đã hết hạn');
      err.status = 400;
      throw err;
    }

    user.password = newPassword; // hook hash
    user.isVerified = true;
    user.mustChangePassword = false;
    user.inviteToken = null as any;
    user.inviteExpires = null as any;
    await user.save();

    return { ok: true };
  }

  /** Gửi lại email mời (chỉ khi chưa kích hoạt) */
  static async resendInvite(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User không tồn tại');

    if (user.isVerified) {
      const err: any = new Error('Tài khoản đã kích hoạt');
      err.status = 400;
      throw err;
    }

    const minutes = Number(process.env.INVITE_EXPIRES_MINUTES || 60);
    user.inviteToken = crypto.randomUUID();
    user.inviteExpires = new Date(Date.now() + minutes * 60 * 1000);
    await user.save();

    const origin = process.env.APP_ORIGIN || 'http://localhost:5173';
    const inviteLink = `${origin}/activate?token=${encodeURIComponent(user.inviteToken!)}`;
    const html = buildInviteEmailHtml(user.name, inviteLink);

    await sendMail(user.email, 'Kích hoạt tài khoản HRM', html); // ✅ chỉ gửi 1 lần bằng hàm mới
    return { id: user.id, email: user.email, sent: true };
  }

  static async getSelf(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'name',
        'email',
        'birthDate',
        'status',
        'phoneNumber',
        'address',
        'isVerified',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'department'],
          include: [
            {
              model: Permission,
              attributes: ['name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) throw new NotFoundError('User không tồn tại');

    const role = user.role
      ? {
          id: user.role.id,
          name: user.role.name,
          department: (user.role as any).department ?? null,
        }
      : null;

    const permissionNames = Array.isArray((user.role as any)?.permissions)
      ? (user.role as any).permissions.map((p: Permission) => p.name)
      : [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      status: user.status,
      phoneNumber: user.phoneNumber,
      address: user.address,
      isVerified: user.isVerified,
      role,
      permissionNames,
      lastLoginAt: (user as any).lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static async updateSelf(
    userId: number,
    change: {
      name?: string;
      email?: string;
      phoneNumber?: string | null;
      address?: string | null;
      birthDate?: string | Date | null;
    }
  ) {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User không tồn tại');

    const updates: any = {};

    if (change.name !== undefined) {
      const n = String(change.name).trim();
      if (n.length < 2) {
        const err: any = new Error('Tên tối thiểu 2 ký tự');
        err.status = 400;
        throw err;
      }
      updates.name = n;
    }

    if (change.email !== undefined) {
      const e = String(change.email).trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(e)) {
        const err: any = new Error('Email không hợp lệ');
        err.status = 400;
        throw err;
      }
      if (e !== user.email) {
        const dup = await User.count({
          where: { email: e, id: { [Op.ne]: userId } },
        });
        if (dup) {
          const err: any = new Error('Email đã được sử dụng');
          err.status = 409;
          throw err;
        }
      }
      updates.email = e;
    }

    if (change.phoneNumber !== undefined) {
      updates.phoneNumber = change.phoneNumber?.toString().trim() || null;
    }

    if (change.address !== undefined) {
      const a = String(change.address).trim();
      if (a.length < 2) {
        const err: any = new Error('Địa chỉ tối thiểu 2 ký tự');
        err.status = 400;
        throw err;
      }
      updates.address = a;
    }

    if (change.birthDate !== undefined) {
      if (!change.birthDate) {
        updates.birthDate = null;
      } else {
        const d = new Date(change.birthDate);
        if (Number.isNaN(d.getTime())) {
          const err: any = new Error('Ngày sinh không hợp lệ');
          err.status = 400;
          throw err;
        }
        updates.birthDate = d;
      }
    }

    await user.update(updates);

    // trả về giống getSelf để FE dùng lại ngay
    return this.getSelf(user.id);
  }
}
