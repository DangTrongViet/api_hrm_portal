import { Router } from 'express';
import authMiddleware from '@middleware/auth';
import * as Ctr from '@controller/attendance.controller';

const router = Router();

// Self
router.post('/check-in', authMiddleware, Ctr.checkIn);
router.post('/check-out', authMiddleware, Ctr.checkOut);
router.get('/today', authMiddleware, Ctr.today);
router.get('/me', authMiddleware, Ctr.listMine);

// Admin
router.get('/admin', authMiddleware, Ctr.adminList);
router.get('/admin/summary', authMiddleware, Ctr.adminSummary);
router.post('/admin', authMiddleware, Ctr.adminUpsert);
router.patch('/admin/:id', authMiddleware, Ctr.adminUpsert);
router.delete('/admin/:id', authMiddleware, Ctr.adminRemove);

export default router;
