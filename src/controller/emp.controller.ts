// src/controller/emp.controller.ts
import { Request, Response, NextFunction } from 'express';
import { EmpService } from '@service';

export default class EmployeesController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await EmpService.list(req.query as any);
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }
      const emp = await EmpService.getById(id);
      if (!emp) return res.status(404).json({ message: 'Không tìm thấy' });
      res.json(emp);
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.id ?? null; // 👈 lấy từ token đã decode
      // Nếu EmpService.create hỗ trợ createdBy/user_id… bạn có thể truyền xuống:
      const payload = {
        ...req.body,
        createdBy: actorId, // tuỳ schema của bảng employees (nếu có cột)
      };
      const emp = await EmpService.create(payload);
      res.status(201).json(emp);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }
      const actorId = req.user?.id ?? null;
      const payload = {
        ...req.body,
        updatedBy: actorId, // tuỳ schema (nếu có cột updatedBy)
      };
      const emp = await EmpService.update(id, payload);
      if (!emp) return res.status(404).json({ message: 'Không tìm thấy' });
      res.json(emp);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
      }
      const r = await EmpService.remove(id, true);
      res.json(r);
    } catch (e) {
      next(e);
    }
  }

  static async userOptions(req: Request, res: Response) {
    try {
      const employees = await EmpService.listWithoutContract();
      res.json(employees);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching employees', error: err });
    }
  }
}
