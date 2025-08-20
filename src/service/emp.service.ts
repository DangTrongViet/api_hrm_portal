import { Op } from 'sequelize';
import Employee from '@models/employees.model';
import { User } from '@models/user.model';
import { Contract } from '@models/contracts.model';
import { NotFoundError } from '@helper';

export type ListParams = {
  q?: string;
  department?: string;
  status?: 'active' | 'inactive';
  sort?: 'full_name' | 'department' | 'status' | 'createdAt' | 'updatedAt';
  dir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
};

type CreatePayload = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  status?: 'active' | 'inactive';
  user_id?: number | null; // 👈 thêm
};

type UpdatePayload = Partial<CreatePayload>;

const SORT_KEYS = new Set([
  'full_name',
  'department',
  'status',
  'createdAt',
  'updatedAt',
] as const);

export default class EmployeesService {
  static async list(params: ListParams = {}) {
    const sortReq = params.sort ?? 'full_name';
    const sort = (
      SORT_KEYS.has(sortReq) ? sortReq : 'full_name'
    ) as NonNullable<ListParams['sort']>;
    const dir = (params.dir ?? 'asc').toUpperCase() as 'ASC' | 'DESC';

    const page = Math.max(1, Number(params.page ?? 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize ?? 10)));

    const where: any = {};
    if (params.q?.trim()) {
      const kw = `%${params.q.trim()}%`;
      where[Op.or] = [
        { full_name: { [Op.like]: kw } },
        { email: { [Op.like]: kw } },
        { phone: { [Op.like]: kw } },
      ];
    }
    if (params.department?.trim()) where.department = params.department.trim();
    if (params.status) where.status = params.status;

    const { rows, count } = await Employee.findAndCountAll({
      where,
      order: [[sort, dir]],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'department',
        'position',
        'status',
        'user_id',
        'createdAt',
        'updatedAt',
      ],
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });

    return { items: rows, total: count, page, pageSize };
  }

  static async getById(id: number) {
    return Employee.findByPk(id, {
      attributes: [
        'id',
        'full_name',
        'email',
        'phone',
        'department',
        'position',
        'status',
        'user_id',
        'createdAt',
        'updatedAt',
      ],
      include: [{ model: User, attributes: ['id', 'name', 'email'] }],
    });
  }

  static async create(payload: CreatePayload) {
    if (payload.user_id != null) {
      const user = await User.findByPk(payload.user_id);
      if (!user) throw new NotFoundError('User không tồn tại');
      const existed = await Employee.findOne({
        where: { user_id: payload.user_id },
      });
      if (existed) {
        const err: any = new Error(
          'Tài khoản này đã được liên kết với một nhân viên khác'
        );
        err.status = 400;
        throw err;
      }
    }

    const emp = await Employee.create({
      full_name: payload.full_name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      department: payload.department ?? null,
      position: payload.position ?? null,
      status: payload.status ?? 'active',
      user_id: payload.user_id ?? null,
    });
    return emp;
  }

  static async update(id: number, payload: UpdatePayload) {
    const emp = await Employee.findByPk(id);
    if (!emp) return null;

    if (payload.user_id !== undefined) {
      if (payload.user_id === null) {
        emp.user_id = null;
      } else {
        const user = await User.findByPk(payload.user_id);
        if (!user) throw new NotFoundError('User không tồn tại');
        const used = await Employee.findOne({
          where: { user_id: payload.user_id, id: { [Op.ne]: id } },
        });
        if (used) {
          const err: any = new Error(
            'Tài khoản này đã được liên kết với một nhân viên khác'
          );
          err.status = 400;
          throw err;
        }
        emp.user_id = payload.user_id;
      }
    }

    await emp.update({
      full_name: payload.full_name ?? emp.full_name,
      email: payload.email ?? emp.email,
      phone: payload.phone ?? emp.phone,
      department: payload.department ?? emp.department,
      position: payload.position ?? emp.position,
      status: payload.status ?? emp.status,
    });

    return emp;
  }

  static async remove(id: number, _hard: boolean = true) {
    const n = await Employee.destroy({ where: { id } });
    return { hardDeleted: n > 0 };
  }

  static async restore(_id: number) {
    return null;
  }

  static async userOptions(params: { q?: string } = {}) {
    const whereUser: any = { status: 'active' };
    if (params.q?.trim()) {
      const kw = `%${params.q.trim()}%`;
      whereUser[Op.or] = [
        { name: { [Op.like]: kw } },
        { email: { [Op.like]: kw } },
      ];
    }

    const rows = await User.findAll({
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: Employee,
          attributes: [],
          required: false, // LEFT JOIN
        },
      ],
      where: {
        ...whereUser,
        // chỉ lấy user CHƯA có employee
        '$employee.id$': null,
      } as any,
      order: [['name', 'ASC']],
      raw: true,
    });

    return rows.map((r) => ({ id: r.id, name: r.name, email: r.email }));
  }
  static async listWithoutContract() {
    return Employee.findAll({
      where: {
        id: {
          [Op.notIn]: Contract.sequelize?.literal(
            `(SELECT employee_id FROM contracts)`
          ),
        },
      },
    });
  }
}
