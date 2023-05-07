import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'download_total',
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
      name: "date_name",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "date" },
        { name: "name" },
      ]
    },
  ]
})
export class DownloadTotalEntity extends Model {
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
    type: DataType.DATE,
    allowNull: false,
    comment: "YYYY-MM-DD format"
  })
  date: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: "module name"
  })
  name: string;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "download count"
  })
  count: number;
}