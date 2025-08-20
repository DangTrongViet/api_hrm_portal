import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  BelongsToMany,
  Unique,
} from 'sequelize-typescript';
import { Permission } from './permissions.model';
import { RolePermission } from './role_permissions.model';

@Table({
  tableName: 'roles',
  timestamps: true,
})
export class Role extends Model {
  @PrimaryKey
  @AutoIncrement
  @Unique('roles_name_unique')
  @Column({ type: DataType.INTEGER, allowNull: false })
  id!: number;

  // Role model:
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: 'roles_name_unique',
  })
  name!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description!: string | null;

  // ✅ Phòng ban (mới thêm) — nullable để tương thích dữ liệu cũ
  @Column({ type: DataType.STRING(100), allowNull: true })
  department!: string | null;

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions!: Permission[];
}

export default Role;
