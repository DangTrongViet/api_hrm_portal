import { Router } from 'express';
import {
  PayrollAdminController,
  PayrollEmployeeController,
} from '../controller/payroll.controller';
import { hasPermission } from '@middleware/permission';

const router = Router();
const controllerAdmin = new PayrollAdminController();
const controllerEmployee = new PayrollEmployeeController();

router.get(
  '/admin',
  hasPermission(['calculate_payroll'], 'any'),
  controllerAdmin.getAll.bind(controllerAdmin)
);
router.get(
  '/admin/:id',
  hasPermission(['calculate_payroll'], 'any'),
  controllerAdmin.getById.bind(controllerAdmin)
);
router.post(
  '/admin',
  hasPermission(['calculate_payroll'], 'any'),
  controllerAdmin.create.bind(controllerAdmin)
);
router.put(
  '/admin/:id',
  hasPermission(['calculate_payroll'], 'any'),
  controllerAdmin.update.bind(controllerAdmin)
);
router.delete(
  '/admin/:id',
  hasPermission(['calculate_payroll'], 'any'),
  controllerAdmin.delete.bind(controllerAdmin)
);

router.get(
  '/me',
  hasPermission(['view_payroll'], 'any'),
  controllerEmployee.getMyPayroll.bind(controllerEmployee)
);

export default router;
