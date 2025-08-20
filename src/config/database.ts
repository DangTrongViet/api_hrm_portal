import { Sequelize } from 'sequelize-typescript';
import 'dotenv/config';
import {
  User,
  Role,
  Permission,
  RolePermission,
  Employee,
  Contract,
  Attendance,
  Leave,
  Overtime,
  Payroll,
} from '@models/index';

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  models: [
    User,
    Role,
    Permission,
    RolePermission,
    Employee,
    Contract,
    Attendance,
    Leave,
    Overtime,
    Payroll,
  ],
  logging: false,
});
