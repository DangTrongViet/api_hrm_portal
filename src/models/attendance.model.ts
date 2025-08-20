import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { Employee } from './employees.model'; // ❗️DÙNG relative import, KHÔNG dùng '@models'

@Table({ tableName: 'attendance', timestamps: true })
export class Attendance extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Employee)
  @Index
  @Column({ type: DataType.INTEGER, allowNull: false })
  employee_id!: number;

  @BelongsTo(() => Employee, 'employee_id')
  employee!: Employee;

  @Column({ type: DataType.DATE, allowNull: true })
  check_in!: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  check_out!: Date | null;

  // DATEONLY nên để string ('YYYY-MM-DD') cho chắc
  @Column({ type: DataType.DATEONLY, allowNull: true })
  work_date!: string | null;
}

export default Attendance;
