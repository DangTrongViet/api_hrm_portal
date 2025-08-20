// src/service/permission.service.ts
'use strict';

import { Op } from 'sequelize';
import { Permission } from '@models/permissions.model';
import { Role } from '@models/roles.model';
import { NotFoundError } from '@helper';

type PermissionCreateInput = { name: string; description?: string | null };
type PermissionUpdateInput = Partial<PermissionCreateInput>;

export default class PermissionService {
  static async list(
    params: {
      q?: string;
      page?: number;
      pageSize?: number;
      withRoles?: boolean;
    } = {}
  ) {
    const { q, page = 1, pageSize = 10, withRoles = false } = params;
    const where: any = {};
    if (q?.trim()) where.name = { [Op.like]: `%${q.trim()}%` };

    const { rows, count } = await Permission.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: withRoles
        ? [
            {
              model: Role,
              attributes: ['id', 'name'],
              through: { attributes: [] },
            },
          ]
        : [],
    });

    const data = rows.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description ?? null,
      roles:
        withRoles && (p as any).roles
          ? (p as any).roles.map((r: Role) => ({ id: r.id, name: r.name }))
          : undefined,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
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

  static async getById(id: number) {
    const perm = await Permission.findByPk(id, {
      include: [
        {
          model: Role,
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    });
    if (!perm) throw new NotFoundError('Permission không tồn tại');

    return {
      id: perm.id,
      name: perm.name,
      description: perm.description ?? null,
      roles:
        (perm as any).roles?.map((r: Role) => ({ id: r.id, name: r.name })) ??
        [],
      createdAt: perm.createdAt,
      updatedAt: perm.updatedAt,
    };
  }

  static async create(payload: PermissionCreateInput) {
    const perm = await Permission.create({
      name: payload.name.trim(),
      description: payload.description ?? null,
    });
    return this.getById(perm.id);
  }

  static async update(id: number, payload: PermissionUpdateInput) {
    const perm = await Permission.findByPk(id);
    if (!perm) throw new NotFoundError('Permission không tồn tại');

    if (payload.name !== undefined) perm.name = payload.name.trim();
    if (payload.description !== undefined)
      perm.description = payload.description ?? null;

    await perm.save();
    return this.getById(perm.id);
  }

  static async remove(id: number) {
    const perm = await Permission.findByPk(id);
    if (!perm) throw new NotFoundError('Permission không tồn tại');

    // tách khỏi các role trước (an toàn)
    await (perm as any).$set('roles', []);
    await perm.destroy();
    return { ok: true };
  }
}
