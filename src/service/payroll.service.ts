import Payroll from '../models/payroll.model';
import Employee from '../models/employees.model';

export class PayrollAdminService {
  async getAllPayrolls() {
    const payrolls = await Payroll.findAll({
      include: [
        {
          model: Employee,
          attributes: ['id', 'full_name'], // chỉ lấy id + full_name
        },
      ],
      order: [['id', 'DESC']],
    });
    return payrolls;
  }

  async createPayroll(data: any) {
    // Tính net_salary
    const base_salary = Number(data.base_salary) || 0;
    const bonus = Number(data.bonus) || 0;
    const deductions = Number(data.deductions) || 0;
    const net_salary = base_salary + bonus - deductions;

    const payroll = await Payroll.create({
      ...data,
      base_salary,
      bonus,
      deductions,
      net_salary,
    });
    return payroll;
  }

  async updatePayroll(id: number, data: any) {
    const base_salary = Number(data.base_salary) || 0;
    const bonus = Number(data.bonus) || 0;
    const deductions = Number(data.deductions) || 0;
    const net_salary = base_salary + bonus - deductions;

    await Payroll.update(
      { ...data, base_salary, bonus, deductions, net_salary },
      { where: { id } }
    );
    return this.getPayrollById(id);
  }

  async getPayrollById(id: number) {
    return Payroll.findByPk(id, {
      include: [{ model: Employee, attributes: ['id', 'full_name'] }],
    });
  }

  async deletePayroll(id: number) {
    return Payroll.destroy({ where: { id } });
  }
}

export class PayrollEmployeeService {
  // Lấy bảng lương của nhân viên theo userId
  async getPayrollByUser(userId: number) {
    // Tìm employeeId
    const employee = await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true,
    });

    if (!employee) throw new Error('Nhân viên không tồn tại');

    // Lấy bảng lương
    const payroll = await Payroll.findAll({
      where: { employee_id: employee.id },
      include: [
        {
          model: Employee,
          attributes: ['id', 'full_name'],
        },
      ],
      order: [['period_start', 'DESC']],
    });

    return payroll;
  }
}
