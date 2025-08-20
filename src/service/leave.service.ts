import { Leave } from '../models/leaves.model';
import { Employee } from '../models/employees.model';
import { StatusLeave } from '@models/enums';
import { CreateLeaveDto, UpdateLeaveDto } from '../dto/leave.dto';

export class LeaveService {
  async createLeave(employeeId: number, data: CreateLeaveDto) {
    return await Leave.create({ employee_id: employeeId, ...data });
  }

  async updateLeave(leaveId: number, employeeId: number, data: UpdateLeaveDto) {
    const leave = await Leave.findOne({
      where: { id: leaveId, employee_id: employeeId },
    });
    if (!leave) throw new Error('Leave not found');

    return await leave.update(data);
  }

  async cancelLeave(leaveId: number, employeeId: number) {
    const leave = await Leave.findOne({
      where: { id: leaveId, employee_id: employeeId },
    });
    if (!leave) throw new Error('Leave not found');

    return await leave.destroy();
  }

  async getMyLeaves(employeeId: number, page = 1, limit = 10) {
    return await Leave.findAndCountAll({
      where: { employee_id: employeeId },
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
    });
  }

  async getLeaveById(leaveId: number, employeeId: number) {
    const leave = await Leave.findOne({
      where: { id: leaveId, employee_id: employeeId },
    });
    if (!leave) throw new Error('Leave not found');
    return leave;
  }
}

export class LeaveAdminService {
  async getAllLeaves(page: number, limit: number) {
    const offset = (page - 1) * limit;

    return await Leave.findAndCountAll({
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Employee,
          attributes: ['id', 'full_name'], // chỉ lấy id + tên
        },
      ],
    });
  }

  async getLeaveById(leaveId: number) {
    const leave = await Leave.findByPk(leaveId, {
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'full_name'] },
      ],
    });
    if (!leave) throw new Error('Leave not found');
    return leave;
  }

  async updateStatus(leaveId: number, status: StatusLeave) {
    const leave = await Leave.findByPk(leaveId);
    if (!leave) throw new Error('Leave not found');

    if (leave.status !== StatusLeave.PENDING) {
      throw new Error('Only pending leaves can be updated');
    }

    leave.status = status;
    await leave.save();
    return leave;
  }
  async deleteLeaveByAdmin(leaveId: number) {
    const leave = await Leave.findOne({ where: { id: leaveId } });
    if (!leave) {
      throw new Error('Leave not found');
    }

    // Chỉ cho phép xóa khi đã approved hoặc rejected
    if (leave.status === 'pending') {
      throw new Error('Cannot delete a pending leave');
    }

    await leave.destroy();
    return true;
  }
}
