import bcrypt from "bcrypt";
import { sequelize } from "./config/database";
import { User, Role, Permission, RolePermission } from "./models";

export const seed = async () => {
  try {
    // Đồng bộ DB (không xóa dữ liệu cũ)
    await sequelize.sync();

    // --- Tạo Roles
    const [adminRole] = await Role.findOrCreate({ where: { name: "Admin" } });
    const [hrRole] = await Role.findOrCreate({ where: { name: "Employee" } });
    const [managerRole] = await Role.findOrCreate({ where: { name: "Manager" } });
    const [employeeRole] = await Role.findOrCreate({ where: { name: "Employee" } });
    const [accountantRole] = await Role.findOrCreate({ where: { name: "Accountant" } });

    // --- Tạo Permissions
    const permissionsData = [
      { name: "manage_users", description: "Quản lý người dùng" },
      { name: "manage_roles", description: "Quản lý vai trò" },
      { name: "view_attendance", description: "Xem chấm công" },
      { name: "approve_leaves", description: "Duyệt nghỉ phép" },
      { name: "approve_overtime", description: "Duyệt tăng ca" },
      { name: "request_leave", description: "Gửi yêu cầu nghỉ phép" },
      { name: "checkin_checkout", description: "Chấm công vào/ra" },
      { name: "view_payroll", description: "Xem bảng lương" },
      { name: "manage_contracts", description: "Quản lý hợp đồng" },
      { name: "calculate_payroll", description: "Tính lương" },
      { name: "permission_love", description: "Có quyền được yêu" },
      { name: "manage_attendance", description: "Quản lý chấm công" },
      { name: "request_overtime", description: "Gửi yêu cầu tăng ca" },
    ];

    const permissions: Permission[] = [];
    for (const p of permissionsData) {
      const [perm] = await Permission.findOrCreate({ where: { name: p.name }, defaults: p });
      permissions.push(perm);
    }

    // --- Tạo Role-Permission
    const rolePermissions = [
      { role: adminRole, perms: ["manage_users","manage_roles","view_attendance","approve_leaves","approve_overtime","checkin_checkout","manage_contracts","calculate_payroll","permission_love","manage_attendance"] },
      { role: hrRole, perms: ["view_attendance","approve_leaves"] },
      { role: managerRole, perms: ["approve_overtime"] },
      { role: employeeRole, perms: ["request_leave","checkin_checkout","view_payroll","permission_love","request_overtime"] },
      { role: accountantRole, perms: ["view_payroll","manage_contracts","calculate_payroll"] },
    ];

    for (const rp of rolePermissions) {
      for (const permName of rp.perms) {
        const perm = permissions.find(p => p.name === permName);
        if (perm) {
          await RolePermission.findOrCreate({
            where: { role_id: rp.role.id, permission_id: perm.id },
          });
        }
      }
    }

    // --- Tạo Users
    const adminPass = await bcrypt.hash("12345678", 10);
    await User.findOrCreate({
      where: { email: "viet113059@gmail.com" },
      defaults: { name: "Admin User", password: adminPass, role_id: adminRole.id },
    });

    const staffPass = await bcrypt.hash("12345678", 10);
    await User.findOrCreate({
      where: { email: "vietkun2k4@gmail.com" },
      defaults: { name: "Employee User", password: staffPass, role_id: employeeRole.id },
    });

    console.log("Seeding done ✅");
  } catch (error) {
    console.error("Seed failed:", error);
  }
};
