// controllers/contract.controller.ts
import { Request, Response, NextFunction } from 'express';
import ContractService from '@service/contract.service';

export default class ContractController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query as any;
      res.json(await ContractService.list({ page, pageSize }));
    } catch (e) {
      next(e);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ContractService.get(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ContractService.create(req.body));
    } catch (e) {
      next(e);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ContractService.update(Number(req.params.id), req.body));
    } catch (e) {
      next(e);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await ContractService.remove(Number(req.params.id)));
    } catch (e) {
      next(e);
    }
  }

  static async exportWord(req: Request, res: Response, next: NextFunction) {
    try {
      const filePath = await ContractService.exportWord(Number(req.params.id));
      res.download(filePath);
    } catch (e) {
      next(e);
    }
  }
}
