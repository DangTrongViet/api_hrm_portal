// src/routes/dashboard.route.ts
import { Router } from 'express';
import DashboardAdminController from '../controller/dashboard.controller';
import { hasPermission } from '@middleware/permission';

const router = Router();

router.use(hasPermission(['manage-roles'], 'any'));
// Tổng số nhân viên
router.get('/total-employees', DashboardAdminController.getTotalEmployees);
// Tổng số theo trạng thái (tuỳ chọn)
router.get('/employee-summary', DashboardAdminController.getEmployeeSummary);

// Tổng số người dùng
router.get('/total-users', DashboardAdminController.getTotalUsers);
// Tổng số theo trạng thái (tuỳ chọn)
router.get('/user-summary', DashboardAdminController.getUsersSummary);

// Tổng số hợp đồng
router.get('/total-contracts', DashboardAdminController.getTotalContracts);
// Tổng số theo trạng thái (tuỳ chọn)
router.get('/contract-summary', DashboardAdminController.getContractSummary);

// Tổng số đơn nghỉ
router.get('/total-leaves', DashboardAdminController.getTotalLeaves);
// Tổng số theo trạng thái (tuỳ chọn)
router.get('/leave-summary', DashboardAdminController.getLeaveSummary);

// Tổng số hợp đồng
router.get('/total-overtimes', DashboardAdminController.getTotalOvertimes);
// Tổng số theo trạng thái (tuỳ chọn)
router.get('/overtime-summary', DashboardAdminController.getOvertimeSummary);

// Tổng số bảng lương
router.get('/total-payrolls', DashboardAdminController.getTotalPayrolls);

// Tổng số vai trò
router.get('/total-roles', DashboardAdminController.getTotalRoles);

// Tổng số quyền
router.get('/total-permissions', DashboardAdminController.getTotalPermissions);

export default router;
