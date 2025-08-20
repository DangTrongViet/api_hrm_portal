import Overtime from '../models/overtime.model';
import Employee from '../models/employees.model';
import { StatusOvertime } from '@models/enums';
export class OvertimeAdminService {
  async createOvertime(data: any) {
    return await Overtime.create(data);
  }

  async getAllOvertime() {
    const overtime = await Overtime.findAll({
      include: [
        {
          model: Employee,
          attributes: ['full_name'], // Lấy ra tên nhân viên
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    return overtime;
  }

  async getOvertimeById(id: number) {
    return await Overtime.findByPk(id);
  }

  async updateOvertime(id: number, data: any) {
    const overtime = await Overtime.findByPk(id);
    if (!overtime) throw new Error('Overtime not found');
    return await overtime.update(data);
  }

  async deleteOvertime(id: number) {
    const overtime = await Overtime.findByPk(id);
    if (!overtime) throw new Error('Overtime not found');
    await overtime.destroy();
    return true;
  }
  async approveOvertime(id: number) {
    const overtime = await Overtime.findByPk(id);
    if (!overtime) throw new Error('Overtime not found');

    // Chỉ duyệt nếu đang ở trạng thái pending
    if (overtime.status !== 'pending') {
      throw new Error('Only pending overtime can be approved');
    }

    overtime.status = StatusOvertime.APPROVED;
    await overtime.save();
    return overtime;
  }
  async rejectOvertime(id: number) {
    const overtime = await Overtime.findByPk(id);
    if (!overtime) throw new Error('Overtime not found');

    if (overtime.status !== StatusOvertime.PENDING) {
      throw new Error('Only pending overtime can be rejected');
    }

    overtime.status = StatusOvertime.REJECTED;
    await overtime.save();
    return overtime;
  }
}

export class OvertimeEmployeeService {
  async createOvertime(employeeId: number, data: any) {
    return await Overtime.create({
      ...data,
      employee_id: employeeId,
      status: 'pending',
    });
  }

  async getMyOvertimes(employeeId: number) {
    return await Overtime.findAll({
      where: { employee_id: employeeId },
      order: [['createdAt', 'DESC']],
    });
  }

  async updateMyOvertime(employeeId: number, id: number, data: any) {
    const overtime = await Overtime.findOne({
      where: { id, employee_id: employeeId },
    });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'pending')
      throw new Error('Only pending requests can be updated');

    await overtime.update(data);
    return overtime;
  }

  async deleteMyOvertime(employeeId: number, id: number) {
    const overtime = await Overtime.findOne({
      where: { id, employee_id: employeeId },
    });
    if (!overtime) throw new Error('Overtime request not found');
    if (overtime.status !== 'pending')
      throw new Error('Only pending requests can be deleted');

    await overtime.destroy();
    return { message: 'Deleted successfully' };
  }
}

// Tạo instance để import ở controller
export const overtimeAdminService = new OvertimeAdminService();
export const overtimeEmployeeService = new OvertimeEmployeeService();
