// src/controller/permission.controller.ts
'use strict';

import { Request, Response, NextFunction } from 'express';
import PermissionService from '@service/permission.service';

export default class PermissionController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, page, pageSize, withRoles } = req.query as any;
      const data = await PermissionService.list({
        q,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
        withRoles: withRoles === '1' || withRoles === 'true',
      });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await PermissionService.getById(id));
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body || {};
      if (!name) return res.status(400).json({ message: 'Thiếu name' });
      const data = await PermissionService.create({ name, description });
      res.status(201).json(data);
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, description } = req.body || {};
      const data = await PermissionService.update(id, { name, description });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      res.json(await PermissionService.remove(id));
    } catch (e) {
      next(e);
    }
  }
}
