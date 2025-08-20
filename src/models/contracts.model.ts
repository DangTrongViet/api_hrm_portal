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
import { StatusContracts } from './enums';

@Table({
  tableName: 'contracts',
  timestamps: true,
})
export class Contract extends Model {
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

  @BelongsTo(() => Employee)
  employee!: Employee;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  contract_type!: string | null;

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
    type: DataType.DECIMAL(15, 2),
    allowNull: true,
  })
  salary!: number | null;

  @Column({
    type: DataType.ENUM('valid', 'expired', 'terminated'),
    defaultValue: 'valid',
    allowNull: false,
  })
  status!: StatusContracts;
}

export default Contract;
