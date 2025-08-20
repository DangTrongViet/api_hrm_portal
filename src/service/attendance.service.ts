// src/service/attendance.service.ts
'use strict';

import { Op } from 'sequelize';
import Attendance from '@models/attendance.model';
import Employee from '@models/employees.model';
import { NotFoundError } from '@helper';

/** YYYY-MM-DD (theo local time) */
function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** YYYY-MM → [from, to] (cùng định dạng YYYY-MM-DD, inclusive) */
function monthRange(month: string): [string, string] {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m)
    throw Object.assign(new Error('Tháng không hợp lệ'), { status: 400 });
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0); // ngày cuối của tháng
  return [ymd(start), ymd(end)];
}

type ListQuery = {
  page?: number;
  pageSize?: number;
  month?: string; // YYYY-MM
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  employeeId?: number;
  userId?: number;
};

function ensureCheckoutAfterCheckin(
  check_in?: string | null,
  check_out?: string | null
) {
  if (check_in && check_out) {
    const tIn = new Date(check_in).getTime();
    const tOut = new Date(check_out).getTime();
    if (Number.isFinite(tIn) && Number.isFinite(tOut) && tOut < tIn) {
      throw Object.assign(new Error('check_out không được trước check_in'), {
        status: 400,
      });
    }
  }
}

export default class AttendanceService {
  // ===== COMMON / SELF HELPERS =====
  static async getEmployeeIdByUser(userId: number) {
    const emp = await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
    });
    if (!emp) {
      throw Object.assign(new Error('Tài khoản chưa liên kết nhân viên'), {
        status: 400,
      });
    }
    return emp.id;
  }

  // ===== SELF =====
  static async todaySelf(userId: number) {
    const employeeId = await this.getEmployeeIdByUser(userId);
    const today = ymd();
    const rec = await Attendance.findOne({
      where: { employee_id: employeeId, work_date: today },
      attributes: ['id', 'employee_id', 'work_date', 'check_in', 'check_out'],
    });

    return {
      employee_id: employeeId,
      work_date: today,
      checkedIn: !!rec?.check_in,
      checkedOut: !!rec?.check_out,
      check_in: rec?.check_in ?? null,
      check_out: rec?.check_out ?? null,
    };
  }

  static async checkInSelf(userId: number) {
    const employeeId = await this.getEmployeeIdByUser(userId);
    const today = ymd();
    const existed = await Attendance.findOne({
      where: { employee_id: employeeId, work_date: today },
    });

    if (existed?.check_in) {
      throw Object.assign(new Error('Bạn đã check-in hôm nay rồi'), {
        status: 400,
      });
    }
    if (existed) {
      await existed.update({ check_in: new Date() });
      return existed;
    }
    return Attendance.create({
      employee_id: employeeId,
      work_date: today,
      check_in: new Date(),
      check_out: null,
    });
  }

  static async checkOutSelf(userId: number) {
    const employeeId = await this.getEmployeeIdByUser(userId);
    const today = ymd();
    const rec = await Attendance.findOne({
      where: { employee_id: employeeId, work_date: today },
    });

    if (!rec || !rec.check_in) {
      throw Object.assign(new Error('Bạn chưa check-in hôm nay'), {
        status: 400,
      });
    }
    if (rec.check_out) {
      throw Object.assign(new Error('Bạn đã check-out hôm nay rồi'), {
        status: 400,
      });
    }
    await rec.update({ check_out: new Date() });
    return rec;
  }

  static async listSelf(
    userId: number,
    q: Omit<ListQuery, 'employeeId' | 'userId'>
  ) {
    const employeeId = await this.getEmployeeIdByUser(userId);
    return this.listAdmin({ ...q, employeeId });
  }

  // ===== ADMIN LIST =====
  static async listAdmin(params: ListQuery) {
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize || 20)));

    const where: any = {};

    // filter theo employeeId hoặc userId
    if (params.employeeId) where.employee_id = params.employeeId;
    if (params.userId && !params.employeeId) {
      const emp = await Employee.findOne({
        where: { user_id: params.userId },
        attributes: ['id'],
      });
      where.employee_id = emp ? emp.id : -1;
    }

    // filter theo tháng / khoảng ngày
    if (params.month) {
      const [f, t] = monthRange(params.month);
      where.work_date = { [Op.between]: [f, t] };
    }
    if (params.from || params.to) {
      const f = params.from || '1970-01-01';
      const t = params.to || '2999-12-31';
      where.work_date = { [Op.between]: [f, t] };
    }

    const { rows, count } = await Attendance.findAndCountAll({
      where,
      order: [
        ['work_date', 'DESC'],
        ['employee_id', 'ASC'],
        ['id', 'DESC'],
      ],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      attributes: ['id', 'employee_id', 'work_date', 'check_in', 'check_out'],
      include: [
        {
          model: Employee,
          attributes: ['id', 'full_name', 'email'],
          required: false,
        },
      ],
    });

    const data = rows.map((r) => ({
      id: r.id,
      employee_id: r.employee_id,
      work_date: r.work_date as unknown as string,
      check_in: r.check_in ?? null,
      check_out: r.check_out ?? null,
      employee: (r as any).employee
        ? {
            id: (r as any).employee.id,
            full_name: (r as any).employee.full_name,
            email: (r as any).employee.email,
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

  // ===== ADMIN SUMMARY =====
  static async summaryAdmin(params: ListQuery) {
    // Lấy tất cả bản ghi trong khoảng chọn để tính toán (không phân trang)
    const where: any = {};

    if (params.employeeId) where.employee_id = params.employeeId;
    if (params.userId && !params.employeeId) {
      const emp = await Employee.findOne({
        where: { user_id: params.userId },
        attributes: ['id'],
      });
      where.employee_id = emp ? emp.id : -1;
    }

    if (params.month) {
      const [f, t] = monthRange(params.month);
      where.work_date = { [Op.between]: [f, t] };
    }
    if (params.from || params.to) {
      const f = params.from || '1970-01-01';
      const t = params.to || '2999-12-31';
      where.work_date = { [Op.between]: [f, t] };
    }

    const all = await Attendance.findAll({
      where,
      attributes: ['work_date', 'check_in', 'check_out'],
      order: [['work_date', 'ASC']],
    });

    const presentDates = new Set<string>();
    let daysCompleted = 0;
    let totalMs = 0;

    for (const r of all) {
      const d = String(r.work_date);
      if (r.check_in || r.check_out) presentDates.add(d);
      if (r.check_in && r.check_out) {
        daysCompleted += 1;
        const ms =
          new Date(r.check_out as any).getTime() -
          new Date(r.check_in as any).getTime();
        if (Number.isFinite(ms) && ms > 0) totalMs += ms;
      }
    }

    const totalHours = Math.round((totalMs / 3600000) * 10) / 10; // 1 số thập phân
    return {
      daysPresent: presentDates.size,
      daysCompleted,
      totalHours,
    };
  }

  // ===== ADMIN UPSERT (create/update) =====
  static async adminUpsert(payload: {
    id?: number;
    employee_id: number;
    work_date: string; // YYYY-MM-DD
    check_in?: string | null;
    check_out?: string | null;
  }) {
    if (!payload.employee_id || !payload.work_date) {
      throw Object.assign(new Error('Thiếu employee_id hoặc work_date'), {
        status: 400,
      });
    }

    const emp = await Employee.findByPk(payload.employee_id);
    if (!emp) throw new NotFoundError('Nhân viên không tồn tại');

    const check_in = payload.check_in ?? null;
    const check_out = payload.check_out ?? null;
    ensureCheckoutAfterCheckin(check_in, check_out);

    if (payload.id) {
      // Update theo id
      const rec = await Attendance.findByPk(payload.id);
      if (!rec) throw new NotFoundError('Bản ghi không tồn tại');

      // Nếu đổi employee_id + work_date → kiểm tra trùng
      if (
        rec.employee_id !== payload.employee_id ||
        String(rec.work_date) !== payload.work_date
      ) {
        const dup = await Attendance.findOne({
          where: {
            employee_id: payload.employee_id,
            work_date: payload.work_date,
          },
          attributes: ['id'],
        });
        if (dup) {
          throw Object.assign(
            new Error(
              'Đã tồn tại bản ghi chấm công cho nhân viên này trong ngày này'
            ),
            { status: 409 }
          );
        }
      }

      await rec.update({
        employee_id: payload.employee_id,
        work_date: payload.work_date,
        check_in: check_in ? new Date(check_in) : null,
        check_out: check_out ? new Date(check_out) : null,
      });

      return rec;
    }

    // Tạo mới — tránh trùng employee_id + work_date
    const existed = await Attendance.findOne({
      where: { employee_id: payload.employee_id, work_date: payload.work_date },
      attributes: ['id'],
    });
    if (existed) {
      // Nếu bạn muốn cập nhật luôn, giữ nhánh này;
      // còn nếu muốn báo lỗi, đổi sang throw 409 giống trên.
      await existed.update({
        check_in: check_in ? new Date(check_in) : null,
        check_out: check_out ? new Date(check_out) : null,
      });
      return existed;
    }

    return Attendance.create({
      employee_id: payload.employee_id,
      work_date: payload.work_date,
      check_in: check_in ? new Date(check_in) : null,
      check_out: check_out ? new Date(check_out) : null,
    });
  }

  // ===== ADMIN DELETE =====
  static async adminRemove(id: number) {
    const n = await Attendance.destroy({ where: { id } });
    if (!n) throw new NotFoundError('Không tìm thấy bản ghi');
    return { deleted: true };
  }
}
