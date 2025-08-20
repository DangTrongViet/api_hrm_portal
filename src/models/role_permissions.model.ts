import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  PrimaryKey,
} from 'sequelize-typescript';
import { Role, Permission } from '@models';

@Table({
  tableName: 'role_permissions',
  timestamps: false, // Không dùng timestamps vì đã có created_at
})
export class RolePermission extends Model {
  @ForeignKey(() => Role)
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  role_id!: number;

  @ForeignKey(() => Permission)
  @PrimaryKey
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  permission_id!: number;
}

export default RolePermission;
