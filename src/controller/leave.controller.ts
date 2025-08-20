import { Request, Response } from 'express';
import { LeaveService, LeaveAdminService } from '../service/leave.service';
import { CreateLeaveDto, UpdateLeaveDto } from '../dto/leave.dto';
import { StatusLeave } from '@models/enums';
import Employee from '@models/employees.model';

export class LeaveController {
  private leaveService: LeaveService;

  constructor() {
    this.leaveService = new LeaveService();
  }

  createLeave = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id; // req.user gán từ middleware auth

      const employeeId = (await Employee.findOne({
        where: { user_id: userId },
        attributes: ['id'],
        raw: true,
      }))!.id;

      if (!employeeId) return res.status(401).json({ message: 'Unauthorized' });

      const leaveData: CreateLeaveDto = req.body;
      const leave = await this.leaveService.createLeave(employeeId, leaveData);

      res.status(201).json({ success: true, data: leave });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  updateLeave = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      const employeeId = (await Employee.findOne({
        where: { user_id: userId },
        attributes: ['id'],
        raw: true,
      }))!.id;

      const updateData: UpdateLeaveDto = req.body;
      const leave = await this.leaveService.updateLeave(
        leaveId,
        employeeId,
        updateData
      );

      res.json({ success: true, data: leave });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  cancelLeave = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      const employeeId = (await Employee.findOne({
        where: { user_id: userId },
        attributes: ['id'],
        raw: true,
      }))!.id;

      await this.leaveService.cancelLeave(leaveId, employeeId);
      res.json({ success: true, message: 'Leave cancelled' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  getMyLeaves = async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      const employeeId = (await Employee.findOne({
        where: { user_id: userId },
        attributes: ['id'],
        raw: true,
      }))!.id;

      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');

      const result = await this.leaveService.getMyLeaves(
        employeeId,
        page,
        limit
      );
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getLeaveById = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const userId = (req.user as any)?.id;
      const employeeId = (await Employee.findOne({
        where: { user_id: userId },
        attributes: ['id'],
        raw: true,
      }))!.id;

      const leave = await this.leaveService.getLeaveById(leaveId, employeeId);
      res.json({ success: true, data: leave });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  };
}

export class LeaveAdminController {
  private leaveAdminService: LeaveAdminService;

  constructor() {
    this.leaveAdminService = new LeaveAdminService();
  }

  getAllLeaves = async (req: Request, res: Response) => {
    try {
      const page = parseInt((req.query.page as string) || '1');
      const limit = parseInt((req.query.limit as string) || '10');

      const result = await this.leaveAdminService.getAllLeaves(page, limit);

      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  getLeaveById = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const leave = await this.leaveAdminService.getLeaveById(leaveId);
      res.json({ success: true, data: leave });
    } catch (err: any) {
      res.status(404).json({ success: false, message: err.message });
    }
  };

  approveLeave = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const leave = await this.leaveAdminService.updateStatus(
        leaveId,
        StatusLeave.APPROVED
      );
      res.json({ success: true, data: leave });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  rejectLeave = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);
      const leave = await this.leaveAdminService.updateStatus(
        leaveId,
        StatusLeave.REJECTED
      );
      res.json({ success: true, data: leave });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };

  deleteLeaveByAdmin = async (req: Request, res: Response) => {
    try {
      const leaveId = parseInt(req.params.id);

      await this.leaveAdminService.deleteLeaveByAdmin(leaveId);
      res.json({ success: true, message: 'Leave deleted by admin' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  };
}
