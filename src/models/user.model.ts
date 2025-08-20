// src/models/user.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  AllowNull,
  Default,
  BeforeCreate,
  BeforeUpdate,
  DefaultScope,
  Scopes,
  HasOne,
} from 'sequelize-typescript';
import { Role } from './roles.model';
import bcrypt from 'bcrypt';
import { Employee } from './employees.model';
@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, allowNull: false })
  id!: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  email!: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  password!: string;

  @AllowNull(true) @Column(DataType.DATE) birthDate!: Date | null;
  @Column({
    type: DataType.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  })
  status!: 'active' | 'inactive';
  @AllowNull(true) @Column(DataType.STRING(20)) phoneNumber!: string | null;
  @AllowNull(true) @Column(DataType.TEXT) address!: string | null;
  @AllowNull(true) @Column(DataType.STRING(64)) otpCode?: string | null;
  @AllowNull(true) @Column(DataType.DATE) otpExpires?: Date | null;
  @Default(false) @Column(DataType.BOOLEAN) isVerified!: boolean;

  @Default(true) @Column(DataType.BOOLEAN) mustChangePassword!: boolean;
  @AllowNull(true) @Column(DataType.STRING(64)) inviteToken?: string | null;
  @AllowNull(true) @Column(DataType.DATE) inviteExpires?: Date | null;
  @AllowNull(true) @Column(DataType.DATE) lastLoginAt?: Date | null;
  @AllowNull(true) @Column(DataType.INTEGER) createdBy?: number | null;
  @AllowNull(true) @Column(DataType.INTEGER) updatedBy?: number | null;

  @ForeignKey(() => Role)
  @Column({ type: DataType.INTEGER, allowNull: false })
  role_id!: number;

  @BelongsTo(() => Role) role!: Role;
  @HasOne(() => Employee, { foreignKey: 'user_id' })
  employee?: Employee;
  // ✅ Hash password bằng decorator (an toàn với init order)
  @BeforeCreate
  static async hashOnCreate(instance: User) {
    if (instance.password)
      instance.password = await bcrypt.hash(instance.password, 10);
  }
  @DefaultScope(() => ({
    attributes: { exclude: ['password'] },
  }))
  @Scopes(() => ({
    auth: { attributes: { include: ['password'] } }, // dùng khi cần so sánh mật khẩu
  }))
  @BeforeUpdate
  static async hashOnUpdate(instance: User) {
    if (instance.changed('password') && instance.password) {
      instance.password = await bcrypt.hash(instance.password, 10);
    }
  }
}

export default User;
