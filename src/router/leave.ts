import { Router } from 'express';
import {
  LeaveController,
  LeaveAdminController,
} from '../controller/leave.controller';
import { hasPermission } from '@middleware/permission';

const router = Router();
const leaveController = new LeaveController();
const leaveAdminController = new LeaveAdminController();

router.use(hasPermission(['request_leave'], 'any'));
router.post('/employees', leaveController.createLeave);
router.put('/employees/:id', leaveController.updateLeave);
router.delete('/employees/:id', leaveController.cancelLeave);
router.get('/employees', leaveController.getMyLeaves);
router.get('/employees/:id', leaveController.getLeaveById);

router.use(hasPermission(['approve_leaves'], 'any'));
router.get('/admin', leaveAdminController.getAllLeaves);

router.get('/admin/:id', leaveAdminController.getLeaveById);

router.put('/admin/:id/approve', leaveAdminController.approveLeave);

router.put('/admin/:id/reject', leaveAdminController.rejectLeave);
router.delete('/admin/:id', leaveAdminController.deleteLeaveByAdmin);
export default router;
