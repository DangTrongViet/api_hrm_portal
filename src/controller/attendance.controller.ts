import { Request, Response, NextFunction } from 'express';
import AttendanceService from '@service/attendance.service';

// === Self ===
export async function today(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await AttendanceService.todaySelf(req.user!.id));
  } catch (e) {
    next(e);
  }
}
export async function listMine(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize, month, from, to } = req.query as any;
    res.json(
      await AttendanceService.listSelf(req.user!.id, {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
      })
    );
  } catch (e) {
    next(e);
  }
}
export async function checkIn(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await AttendanceService.checkInSelf(req.user!.id);
    res.json({ ok: true, id: r.id });
  } catch (e) {
    next(e);
  }
}
export async function checkOut(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const r = await AttendanceService.checkOutSelf(req.user!.id);
    res.json({ ok: true, id: r.id });
  } catch (e) {
    next(e);
  }
}

// === Admin ===
export async function adminList(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { page, pageSize, month, from, to, employeeId, userId } =
      req.query as any;
    res.json(
      await AttendanceService.listAdmin({
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 20,
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
        employeeId: employeeId ? Number(employeeId) : undefined,
        userId: userId ? Number(userId) : undefined,
      })
    );
  } catch (e) {
    next(e);
  }
}
export async function adminSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { month, from, to, employeeId, userId } = req.query as any;
    res.json(
      await AttendanceService.summaryAdmin({
        month: month || undefined,
        from: from || undefined,
        to: to || undefined,
        employeeId: employeeId ? Number(employeeId) : undefined,
        userId: userId ? Number(userId) : undefined,
      })
    );
  } catch (e) {
    next(e);
  }
}
export async function adminUpsert(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = req.params.id ? Number(req.params.id) : undefined;
    const { employee_id, work_date, check_in, check_out } = req.body || {};
    const r = await AttendanceService.adminUpsert({
      id,
      employee_id: Number(employee_id),
      work_date,
      check_in: check_in ?? null,
      check_out: check_out ?? null,
    });
    res.status(id ? 200 : 201).json(r);
  } catch (e) {
    next(e);
  }
}
export async function adminRemove(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await AttendanceService.adminRemove(Number(req.params.id)));
  } catch (e) {
    next(e);
  }
}
