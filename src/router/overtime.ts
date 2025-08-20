import { Router } from 'express';
import {
  overtimeAdminController,
  overtimeEmployeeController,
} from '../controller/overtime.controller';
import { hasPermission } from '@middleware/permission';

const router = Router();

router.use(hasPermission(['request_overtime'], 'any'));
router.post('/employees', overtimeEmployeeController.create);
router.get('/employees', overtimeEmployeeController.listMy);
router.put('/employees/:id', overtimeEmployeeController.updateMy);
router.delete('/employees/:id', overtimeEmployeeController.deleteMy);

router.use(hasPermission(['approve_overtime'], 'any'));
router.post('/admin', overtimeAdminController.create);
router.get('/admin', overtimeAdminController.findAll);
router.get('/admin:id', overtimeAdminController.findOne);
router.put('/admin/:id', overtimeAdminController.update);
router.delete('/admin/:id', overtimeAdminController.delete);
router.put('/admin/:id/approve', overtimeAdminController.handleApprove);

router.put('/admin/:id/reject', overtimeAdminController.handleReject);
export default router;
