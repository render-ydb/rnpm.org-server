import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'downloads',
  timestamps: true,
  paranoid: true,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "id" },
      ]
    },
    {
      name: "uk_name_date",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "name" },
        { name: "date" },
      ]
    },
    {
      name: "idx_date",
      using: "BTREE",
      fields: [
        { name: "date" },
      ]
    },
  ]
})
export class DownloadsEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: "primary key"
  })
  id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: "create time",
    field: 'gmt_create'
  })
  gmtCreate: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: "modified time",
    field: 'gmt_modified'
  })
  gmtModified: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    comment: "module name"
  })
  name: string;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    comment: "YYYYMM format"
  })
  date: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "01 download count"
  })
  d01: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "02 download count"
  })
  d02: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "03 download count"
  })
  d03: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "04 download count"
  })
  d04: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "05 download count"
  })
  d05: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "06 download count"
  })
  d06: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "07 download count"
  })
  d07: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "08 download count"
  })
  d08: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "09 download count"
  })
  d09: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "10 download count"
  })
  d10: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "11 download count"
  })
  d11: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "12 download count"
  })
  d12: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "13 download count"
  })
  d13: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "14 download count"
  })
  d14: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "15 download count"
  })
  d15: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "16 download count"
  })
  d16: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "17 download count"
  })
  d17: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "18 download count"
  })
  d18: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "19 download count"
  })
  d19: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "20 download count"
  })
  d20: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "21 download count"
  })
  d21: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "22 download count"
  })
  d22: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "23 download count"
  })
  d23: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "24 download count"
  })
  d24: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "25 download count"
  })
  d25: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "26 download count"
  })
  d26: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "27 download count"
  })
  d27: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "28 download count"
  })
  d28: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "29 download count"
  })
  d29: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "30 download count"
  })
  d30: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "31 download count"
  })
  d31: number;
}