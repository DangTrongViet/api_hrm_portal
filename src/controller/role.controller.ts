'use-strict';
import { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import RoleService from '@service/role.service';
import { RolesDeptQuerySchema } from './../validation/roles.validation';
import { ApiResponse } from 'helper';

class RoleController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, page, pageSize, withPermissions } = req.query as any;
      const data = await RoleService.list({
        q,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        withPermissions: withPermissions === '1' || withPermissions === 'true',
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (!id)
        return res.status(400).json({ message: 'Thiếu hoặc id không hợp lệ' });

      const data = await RoleService.getById(id);
      return res.json(data);
    } catch (err: any) {
      return res
        .status(err?.status || 500)
        .json({
          message: err?.parent?.sqlMessage || err?.message || 'Lỗi máy chủ',
        });
    }
  }
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, department, permissionIds } = req.body || {};
      const data = await RoleService.create({
        name,
        description,
        department,
        permissionIds: Array.isArray(permissionIds)
          ? permissionIds.map(Number)
          : undefined,
      });
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, description, department, permissionIds } = req.body || {};
      const data = await RoleService.update(id, {
        name,
        description,
        department,
        permissionIds: Array.isArray(permissionIds)
          ? permissionIds.map(Number)
          : undefined,
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await RoleService.remove(id));
    } catch (e) {
      next(e);
    }
  }

  // ---- permissions on a role ----
  static async addPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { permissionIds } = req.body || {};
      if (!Array.isArray(permissionIds) || !permissionIds.length) {
        return res
          .status(400)
          .json({ message: 'permissionIds phải là mảng số' });
      }
      const data = await RoleService.addPermissions(
        id,
        permissionIds.map(Number)
      );
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async setPermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { permissionIds } = req.body || {};
      if (!Array.isArray(permissionIds)) {
        return res
          .status(400)
          .json({ message: 'permissionIds phải là mảng số (có thể rỗng)' });
      }
      const data = await RoleService.setPermissions(
        id,
        permissionIds.map(Number)
      );
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async removePermission(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = Number(req.params.id);
      const permId = Number(req.params.permId);
      res.json(await RoleService.removePermission(id, permId));
    } catch (e) {
      next(e);
    }
  }
  static async departments(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = RolesDeptQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const msg = parsed.error.issues?.[0]?.message || 'Tham số không hợp lệ';
        return res.status(400).json(ApiResponse.error(msg));
      }
      const data = await RoleService.departments(parsed.data);
      return res.status(200).json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  }
  static async rolesName(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = RolesDeptQuerySchema.safeParse(req.query);
      console.log(parsed);
      if (!parsed.success) {
        const msg = parsed.error.issues?.[0]?.message || 'Tham số không hợp lệ';
        return res.status(400).json(ApiResponse.error(msg));
      }
      console.log('hello');
      const data = await RoleService.rolesName(parsed.data);
      return res.status(200).json(ApiResponse.success(data));
    } catch (err) {
      next(err);
    }
  }
}

export default RoleController;
