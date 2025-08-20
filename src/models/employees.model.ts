// src/models/employee.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { StatusUser } from './enums';
import { User } from './user.model';
import { Contract } from './contracts.model';
import { Leave } from './leaves.model';
import Overtime from './overtime.model';

@Table({ tableName: 'employees', timestamps: true })
export class Employee extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, allowNull: false })
  id!: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  full_name!: string;

  @Column({ type: DataType.STRING(100), unique: true, allowNull: true })
  email!: string | null;

  @Column({ type: DataType.STRING(20), allowNull: true })
  phone!: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  department!: string | null;

  @Column({ type: DataType.STRING(100), allowNull: true })
  position!: string | null;

  @Column({
    type: DataType.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  })
  status!: StatusUser;

  @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
  deleted!: boolean;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  user_id!: number | null;
  @HasOne(() => Contract)
  contract!: Contract;

  @BelongsTo(() => User, { foreignKey: 'user_id' })
  user?: User;
  @HasMany(() => Leave, { foreignKey: 'employee_id' })
  leaves?: Leave[];

  // Employee có nhiều Overtime
  @HasMany(() => Overtime, { foreignKey: 'employee_id', as: 'overtimes' })
  overtimes?: Overtime[];
}
export default Employee;
