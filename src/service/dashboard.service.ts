// src/services/dashboard.service.ts
import Role from '@models/roles.model';
import Employee from '../models/employees.model';
import User from '../models/user.model';
import Permission from '@models/permissions.model';
import Contract from '@models/contracts.model';
import Overtime from '@models/overtime.model';
import Leave from '@models/leaves.model';
import Payroll from '@models/payroll.model';
import * as enums from '@models/enums';

export class DashboardAdminService {
  // Lấy tổng số nhân viên
  async getTotalEmployees() {
    return Employee.count({ where: { deleted: false } });
  }

  // Lấy tổng nhân viên active và inactive (tuỳ chọn)
  async getEmployeeStatusSummary() {
    const active = await Employee.count({
      where: { deleted: false, status: enums.StatusEmployee.ACTIVE },
    });
    const inactive = await Employee.count({
      where: { deleted: false, status: enums.StatusEmployee.INACTIVE },
    });
    return { total: active + inactive, active, inactive };
  }

  async getTotalUsers() {
    return User.count({});
  }

  // Lấy tổng nhân viên active và inactive (tuỳ chọn)
  async getUserStatusSummary() {
    const active = await User.count({
      where: { status: enums.StatusUser.ACTIVE },
    });
    const inactive = await User.count({
      where: { status: enums.StatusUser.INACTIVE },
    });
    return { total: active + inactive, active, inactive };
  }

  async getTotalRole() {
    return Role.count({});
  }

  async getTotalPermission() {
    return Permission.count({});
  }

  async getTotalContract() {
    return Contract.count({});
  }

  async getContractStatusSummary() {
    const expire = await Contract.count({
      where: { status: enums.StatusContracts.EXPIRED },
    });
    const valid = await Contract.count({
      where: { status: enums.StatusContracts.VALID },
    });
    const terminate = await Contract.count({
      where: { status: enums.StatusContracts.TERMINATED },
    });
    return { total: expire + valid + terminate, expire, valid, terminate };
  }

  async getTotalOvertime() {
    return Overtime.count({});
  }

  async getOvertimeStatusSummary() {
    const approve = await Overtime.count({
      where: { status: enums.StatusOvertime.APPROVED },
    });
    const pending = await Overtime.count({
      where: { status: enums.StatusOvertime.PENDING },
    });
    const reject = await Overtime.count({
      where: { status: enums.StatusOvertime.REJECTED },
    });
    return { total: approve + pending + reject, approve, pending, reject };
  }

  async getTotalLeave() {
    return Leave.count({});
  }

  async getLeaveStatusSummary() {
    const approve = await Leave.count({
      where: { status: enums.StatusLeave.APPROVED },
    });
    const pending = await Leave.count({
      where: { status: enums.StatusLeave.PENDING },
    });
    const reject = await Leave.count({
      where: { status: enums.StatusLeave.REJECTED },
    });
    return { total: approve + pending + reject, approve, pending, reject };
  }

  async getTotalPayroll() {
    return Payroll.count({});
  }
}

export default new DashboardAdminService();
