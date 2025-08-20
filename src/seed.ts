import bcrypt from "bcrypt";
import { sequelize } from "./config/database";
import { User, Role, Permission, RolePermission } from "./models";

export const seed = async () => {
  try {
    // Đồng bộ DB, xóa dữ liệu cũ
    await sequelize.sync({ force: true });
    console.log("Database synced ✅");

    // --- Tạo Role ---
    const rolesData = [
      { id: 1, name: "admin", description: "Quản trị hệ thống", department: "IT" },
      { id: 2, name: "hr", description: "Phòng nhân sự", department: "HR" },
      { id: 3, name: "manager", description: "Quản lý cấp trung", department: "Management" },
      { id: 4, name: "employee", description: "Nhân viên", department: "General" },
      { id: 5, name: "accountant", description: "Phòng kế toán", department: "Finance" },
    ];

    const roles = await Role.bulkCreate(rolesData);

    // --- Tạo Permission ---
    const permissionsData = [
      { id: 1, name: "manage_users", description: "Quản lý người dùng" },
      { id: 2, name: "manage_roles", description: "Quản lý vai trò" },
      { id: 3, name: "view_attendance", description: "Xem chấm công" },
      { id: 4, name: "approve_leaves", description: "Duyệt nghỉ phép" },
      { id: 5, name: "approve_overtime", description: "Duyệt tăng ca" },
      { id: 6, name: "request_leave", description: "Gửi yêu cầu nghỉ phép" },
      { id: 7, name: "checkin_checkout", description: "Chấm công vào/ra" },
      { id: 8, name: "view_payroll", description: "Xem bảng lương" },
      { id: 9, name: "manage_contracts", description: "Quản lý hợp đồng" },
      { id: 10, name: "calculate_payroll", description: "Tính lương" },
      { id: 11, name: "permission_love", description: "có quyền được yêu" },
      { id: 12, name: "manage_attendance", description: "Quản lý chấm công" },
      { id: 13, name: "request_overtime", description: "Gửi yêu cầu tăng ca" },
    ];

    const permissions = await Permission.bulkCreate(permissionsData);

    // --- Tạo RolePermission ---
    const rolePermissionData = [
      { role_id: 1, permission_id: 1 },
      { role_id: 1, permission_id: 2 },
      { role_id: 1, permission_id: 3 },
      { role_id: 1, permission_id: 4 },
      { role_id: 1, permission_id: 5 },
      { role_id: 1, permission_id: 7 },
      { role_id: 1, permission_id: 9 },
      { role_id: 1, permission_id: 10 },
      { role_id: 1, permission_id: 11 },
      { role_id: 1, permission_id: 12 },
      { role_id: 2, permission_id: 3 },
      { role_id: 2, permission_id: 4 },
      { role_id: 3, permission_id: 5 },
      { role_id: 4, permission_id: 6 },
      { role_id: 4, permission_id: 7 },
      { role_id: 4, permission_id: 8 },
      { role_id: 4, permission_id: 11 },
      { role_id: 4, permission_id: 13 },
      { role_id: 5, permission_id: 8 },
      { role_id: 5, permission_id: 9 },
      { role_id: 5, permission_id: 10 },
    ];

    await RolePermission.bulkCreate(rolePermissionData);

    // --- Tạo User ---
    const adminPass = await bcrypt.hash("12345678", 10);
    const employeePass = await bcrypt.hash("12345678", 10);

    await User.create({
      name: "Admin User",
      email: "viet113059@gmail.com",
      password: adminPass,
      role_id: 1,
      status: "active",
    });

    await User.create({
      name: "Employee User",
      email: "vietkun2k4@gmail.com",
      password: employeePass,
      role_id: 4,
      status: "active",
    });

    console.log("Seeding done ✅");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};
