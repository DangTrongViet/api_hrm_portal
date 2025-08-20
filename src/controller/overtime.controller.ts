import { Request, Response } from 'express';
import {
  overtimeAdminService,
  overtimeEmployeeService,
} from '../service/overtime.service';
import { Employee } from '../models/employees.model';
class OvertimeAdminController {
  async create(req: Request, res: Response) {
    try {
      const overtime = await overtimeAdminService.createOvertime(req.body);
      res.status(201).json(overtime);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const overtimes = await overtimeAdminService.getAllOvertime();

      res.json(overtimes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async findOne(req: Request, res: Response) {
    try {
      const overtime = await overtimeAdminService.getOvertimeById(
        +req.params.id
      );
      if (!overtime) return res.status(404).json({ message: 'Not found' });
      res.json(overtime);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const overtime = await overtimeAdminService.updateOvertime(
        +req.params.id,
        req.body
      );
      res.json(overtime);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await overtimeAdminService.deleteOvertime(+req.params.id);
      res.json({ message: 'Deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async handleApprove(req: Request, res: Response) {
    try {
      const overtime = await overtimeAdminService.approveOvertime(
        +req.params.id
      );
      res.json(overtime);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  async handleReject(req: Request, res: Response) {
    try {
      const overtime = await overtimeAdminService.rejectOvertime(
        +req.params.id
      );
      res.json(overtime);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }
}

export class OvertimeEmployeeController {
  create = async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const employeeId = (await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true,
    }))!.id;
    const overtime = await overtimeEmployeeService.createOvertime(
      employeeId,
      req.body
    );
    res.json(overtime);
  };

  listMy = async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const employeeId = (await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true,
    }))!.id;
    const overtimes = await overtimeEmployeeService.getMyOvertimes(employeeId);
    res.json(overtimes);
  };

  updateMy = async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const employeeId = (await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true,
    }))!.id;
    const overtime = await overtimeEmployeeService.updateMyOvertime(
      employeeId,
      parseInt(req.params.id),
      req.body
    );
    res.json(overtime);
  };

  deleteMy = async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id;
    const employeeId = (await Employee.findOne({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true,
    }))!.id;
    const result = await overtimeEmployeeService.deleteMyOvertime(
      employeeId,
      parseInt(req.params.id)
    );
    res.json(result);
  };
}

export const overtimeAdminController = new OvertimeAdminController();
export const overtimeEmployeeController = new OvertimeEmployeeController();
