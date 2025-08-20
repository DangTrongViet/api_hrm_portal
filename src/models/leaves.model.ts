import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Employee } from '@models';
import { StatusLeave } from './enums';

@Table({
  tableName: 'leaves',
  timestamps: true, // Tự động thêm createdAt và updatedAt, nhưng sẽ ghi đè bằng giá trị mặc định dưới đây
})
export class Leave extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  id!: number;

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  employee_id!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  start_date!: Date | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
  })
  end_date!: Date | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reason!: string | null;

  @Column({
    type: DataType.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  })
  status!: StatusLeave;

  @BelongsTo(() => Employee, { foreignKey: 'employee_id' })
  employee?: Employee;
}

export default Leave;
