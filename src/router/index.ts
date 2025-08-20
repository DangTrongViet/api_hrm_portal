import { Express } from 'express';
import authRouter from './auth';
import empRouter from './employees';
import userRouter from './user';
import roleRouter from './role';
import authMiddleware from '@middleware/auth';
import { hasPermission } from '@middleware/permission';
import permissionRouter from './permission';
import UserController from '@controller/user.controller';
import attendanceRoute from './attendance';
import contractRoute from './contract';
import leaveRoute from './leave';
import overtimeRoute from './overtime';
import payrollRoute from './payroll.router';
import dashboardRoute from './dashboard';
const route = (app: Express) => {
  app.use('/api/auth', authRouter);
  app.use(
    '/api/employees',
    authMiddleware,
    hasPermission(['manage_users'], 'any'),
    empRouter
  );
  app.use(
    '/api/users',
    authMiddleware,
    hasPermission(['manage_roles', 'manage_users'], 'any'),
    userRouter
  );
  app.use(
    '/api/roles',
    authMiddleware,
    hasPermission(['manage_roles'], 'any'),
    roleRouter
  );
  app.use(
    '/api/permissions',
    authMiddleware,
    hasPermission(['manage_roles'], 'any'),
    permissionRouter
  );
  app.get('/api/me', authMiddleware, UserController.getMe);
  app.patch('/api/me', authMiddleware, UserController.updateMe);
  app.use('/api/attendance', attendanceRoute);
  app.use(
    '/api/contracts',
    authMiddleware,
    hasPermission(['manage_contracts'], 'any'),
    contractRoute
  );
  app.use('/api/leaves', authMiddleware, leaveRoute);
  app.use('/api/overtimes', authMiddleware, overtimeRoute);
  app.use('/api/payroll', authMiddleware, payrollRoute);
  app.use('/api/dashboard', authMiddleware, dashboardRoute);
};
export default route;
