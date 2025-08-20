// src/seed.ts
import bcrypt from "bcrypt";
import { User, Role } from "./models";

export const seed = async () => {
  // Tạo role nếu chưa tồn tại
  const [adminRole] = await Role.findOrCreate({ where: { name: "Admin" } });
  const [staffRole] = await Role.findOrCreate({ where: { name: "Employee" } });

  // Tạo user admin nếu chưa tồn tại
  const adminPass = await bcrypt.hash("123456", 10);
  await User.findOrCreate({
    where: { email: "viet113059@gmail.com" },
    defaults: { name: "Admin User", password: adminPass, roleId: adminRole.id },
  });

  const staffPass = await bcrypt.hash("123456", 10);
  await User.findOrCreate({
    where: { email: "vietkun2k4@gmail.com" },
    defaults: { name: "Employee User", password: staffPass, roleId: staffRole.id },
  });

  console.log("Seeding done ✅");
};