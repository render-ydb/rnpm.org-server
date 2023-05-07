import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'dist_file',
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
      name: "uk_fullname",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "parent" },
        { name: "name" },
      ]
    },
    {
      name: "idx_gmt_modified",
      using: "BTREE",
      fields: [
        { name: "gmt_modified" },
      ]
    },
  ]
})
export class DistFileEntity extends Model {
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
    comment: "file name"
  })
  name: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    defaultValue: "\/",
    comment: "parent dir"
  })
  parent: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    comment: "02-May-2014 01:06"
  })
  date: string;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "file size"
  })
  size: number;

  @Column({
    type: DataType.STRING(40),
    allowNull: true,
    comment: "sha1 hex value"
  })
  sha1: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true
  })
  url: string;
}