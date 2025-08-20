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
import Employee from './employees.model';
import { StatusOvertime } from './enums';

@Table({
  tableName: 'overtime',
  timestamps: true, // Tự động thêm createdAt và updatedAt, nhưng sẽ ghi đè bằng giá trị mặc định dưới đây
})
export class Overtime extends Model {
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
  date!: Date | null;

  @Column({
    type: DataType.DECIMAL(4, 2),
    allowNull: true,
  })
  hours!: number | null;

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
  status!: StatusOvertime;
  @BelongsTo(() => Employee, { foreignKey: 'employee_id', as: 'Employee' })
  employee?: Employee;
}

export default Overtime;
