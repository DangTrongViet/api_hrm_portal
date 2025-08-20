import Role from '@models/roles.model';
import Permission from '@models/permissions.model';
import { NotFoundError } from '@helper';
import { Op, Sequelize, literal } from 'sequelize';

type RoleCreateInput = {
  name: string;
  description?: string | null;
  department?: string | null;
  permissionIds?: number[]; // optional: gán sẵn permissions
};

type RoleUpdateInput = Partial<RoleCreateInput>;
class RoleService {
  static async list(
    params: {
      q?: string;
      page?: number;
      pageSize?: number;
      withPermissions?: boolean;
    } = {}
  ) {
    const { q, page = 1, pageSize = 20, withPermissions = false } = params;

    const where: any = {};
    if (q?.trim()) where.name = { [Op.like]: `%${q.trim()}%` };

    const { rows, count } = await Role.findAndCountAll({
      where,
      offset: (page - 1) * pageSize,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      include: withPermissions
        ? [
            {
              model: Permission,
              attributes: ['id', 'name'],
              through: { attributes: [] },
            },
          ]
        : [],
    });

    const data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description ?? null,
      department: (r as any).department ?? null,
      permissions:
        withPermissions && (r as any).permissions
          ? (r as any).permissions.map((p: Permission) => ({
              id: p.id,
              name: p.name,
            }))
          : undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
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
    if (!id || Number.isNaN(id)) {
      const e: any = new Error('id không hợp lệ');
      e.status = 400;
      throw e;
    }

    try {
      // Kiểm tra bảng 'roles' có cột department hay chưa
      const qi = Role.sequelize!.getQueryInterface();
      const desc = await qi.describeTable('roles');
      const hasDepartment = 'department' in desc;

      const attrs: any[] = ['id', 'name', 'description'];
      if (hasDepartment) attrs.push('department');

      const role = await Role.findByPk(id, {
        attributes: attrs,
        include: [
          {
            model: Permission,
            attributes: ['id', 'name'],
            through: { attributes: [] },
          },
        ],
      });

      if (!role) throw new NotFoundError('Role không tồn tại');
      return role;
    } catch (err: any) {
      const e: any = new Error(
        err?.parent?.sqlMessage || err?.message || 'DB error'
      );
      e.status = err?.status || 500;
      throw e;
    }
  }

  static async create(payload: RoleCreateInput) {
    const { name, description, department, permissionIds } = payload;
    const role = await Role.create({
      name: name.trim(),
      description: description ?? null,
      department: department ?? null,
    });

    if (permissionIds?.length) {
      const perms = await Permission.findAll({ where: { id: permissionIds } });
      await (role as any).$set('permissions', perms);
    }

    return this.getById(role.id);
  }

  static async update(id: number, payload: RoleUpdateInput) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    const { name, description, department, permissionIds } = payload;

    if (name !== undefined) role.name = name.trim();
    if (description !== undefined) role.description = description;
    if (department !== undefined) (role as any).department = department;

    await role.save();

    if (permissionIds) {
      const perms = await Permission.findAll({ where: { id: permissionIds } });
      await (role as any).$set('permissions', perms); // replace
    }

    return this.getById(role.id);
  }

  static async remove(id: number) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    // Option: kiểm tra còn user đang dùng role này hay không trước khi xoá
    await (role as any).$set('permissions', []);
    await role.destroy();

    return { ok: true };
  }

  // ----- Permission operations on role -----

  /** Thêm 1 hoặc nhiều permission vào role (giữ các permission cũ) */
  static async addPermissions(id: number, permissionIds: number[]) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    const perms = await Permission.findAll({ where: { id: permissionIds } });
    await (role as any).$add('permissions', perms);

    return this.getById(id);
  }

  /** Gỡ 1 permission khỏi role */
  static async removePermission(id: number, permId: number) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    const perm = await Permission.findByPk(permId);
    if (!perm) throw new NotFoundError('Permission không tồn tại');

    await (role as any).$remove('permissions', perm);
    return this.getById(id);
  }

  /** Set (thay thế) toàn bộ permission cho role */
  static async setPermissions(id: number, permissionIds: number[]) {
    const role = await Role.findByPk(id);
    if (!role) throw new NotFoundError('Role không tồn tại');

    const perms = await Permission.findAll({ where: { id: permissionIds } });
    await (role as any).$set('permissions', perms);

    return this.getById(id);
  }

  static async departments(params: { q?: string; limit?: number } = {}) {
    const { q, limit = 100 } = params;

    const likeOp = (process.env.DB_DIALECT || '')
      .toLowerCase()
      .includes('postgres')
      ? Op.iLike
      : Op.like;

    const where: any = {
      department: { [Op.ne]: null },
    };

    if (q?.trim()) {
      where.department = { [likeOp]: `%${q.trim()}%` };
    }

    const rows = await Role.findAll({
      where,
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('department')), 'department'],
      ],
      order: [[literal('department'), 'ASC']],
      limit: Math.min(Math.max(Number(limit) || 100, 1), 500),
      raw: true,
    });

    // rows: [{ department: 'IT' }, ...] -> string[]
    return rows.map((r: any) => r.department as string).filter(Boolean);
  }

  static async rolesName(params: { q?: string; limit?: number } = {}) {
    const { q, limit = 100 } = params;

    const likeOp = (process.env.DB_DIALECT || '')
      .toLowerCase()
      .includes('postgres')
      ? Op.iLike
      : Op.like;

    const where: any = { name: { [Op.ne]: null } };
    if (q?.trim()) where.name = { [likeOp]: `%${q.trim()}%` };

    console.log('hello');
    const rows = await Role.findAll({
      where,
      // ✅ lấy 1 id đại diện cho mỗi name (MIN hoặc MAX đều được)
      attributes: [[Sequelize.fn('MIN', Sequelize.col('id')), 'id'], 'name'],
      group: ['name'],
      order: [[literal('name'), 'ASC']],
      limit: Math.min(Math.max(Number(limit) || 100, 1), 500),
      raw: true,
    });
    console.log(rows);

    // => [{ id: number, name: string }]
    return rows
      .map((r: any) => ({ id: Number(r.id), name: String(r.name) }))
      .filter((r) => !!r.name);
  }
}

export default RoleService;
