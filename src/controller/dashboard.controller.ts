// src/controllers/dashboard.controller.ts
import { Request, Response } from 'express';
import DashboardService from '../service/dashboard.service';

export class DashboardAdminController {
  async getTotalEmployees(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalEmployees();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getEmployeeSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getEmployeeStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalUsers(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalUsers();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getUsersSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getUserStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalRoles(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalRole();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalPermissions(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalPermission();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalContracts(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalContract();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getContractSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getContractStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalLeaves(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalLeave();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getLeaveSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getLeaveStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalPayrolls(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalPayroll();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getTotalOvertimes(req: Request, res: Response) {
    try {
      const total = await DashboardService.getTotalOvertime();
      res.json({ success: true, total });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }

  async getOvertimeSummary(req: Request, res: Response) {
    try {
      const summary = await DashboardService.getOvertimeStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  }
}

export default new DashboardAdminController();
