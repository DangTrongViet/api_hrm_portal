import { Request, Response } from 'express';
import {
  PayrollAdminService,
  PayrollEmployeeService,
} from '../service/payroll.service';

const payrollAdminService = new PayrollAdminService();
const payrollEmployeeService = new PayrollEmployeeService();

export class PayrollAdminController {
  async getAll(req: Request, res: Response) {
    try {
      const payrolls = await payrollAdminService.getAllPayrolls();
      res.json(payrolls);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payroll = await payrollAdminService.getPayrollById(id);
      if (!payroll)
        return res.status(404).json({ message: 'Payroll not found' });
      res.json(payroll);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const payroll = await payrollAdminService.createPayroll(req.body);
      res.status(201).json(payroll);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const payroll = await payrollAdminService.updatePayroll(id, req.body);
      if (!payroll)
        return res.status(404).json({ message: 'Payroll not found' });
      res.json(payroll);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const success = await payrollAdminService.deletePayroll(id);
      if (!success)
        return res.status(404).json({ message: 'Payroll not found' });
      res.json({ message: 'Payroll deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  }
}

export class PayrollEmployeeController {
  // GET /payroll/me
  async getMyPayroll(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const payrolls = await payrollEmployeeService.getPayrollByUser(userId);

      if (!payrolls || payrolls.length === 0)
        return res.status(404).json({ message: 'Chưa có bảng lương' });

      res.json({ message: 'Success', data: payrolls });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
}
