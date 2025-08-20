// permissions.model.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
  AllowNull,
} from 'sequelize-typescript';
import { Role } from './roles.model';
import { RolePermission } from './role_permissions.model';

@Table({
  tableName: 'permissions',
  timestamps: true,
})
export class Permission extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({ type: DataType.INTEGER, allowNull: false })
  id!: number;

  @Column({ type: DataType.STRING(50), allowNull: false, unique: true })
  name!: string;

  @AllowNull(true)
  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  // ✅ Quan hệ với Role
  @BelongsToMany(() => Role, () => RolePermission)
  roles!: Role[];
}

export default Permission;
