import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'package_version_blocklist',
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
      name: "uk_name_version",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "name" },
        { name: "version" },
      ]
    },
  ]
})
export class PackageVersionBlocklistEntity extends Model {
  @Column({
    autoIncrement: true,
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    primaryKey: true,
    comment: "primary key"
  })
  id: number;

  @Column({
    type: DataType.DATE(3),
    allowNull: false,
    comment: "create time",
    field: 'gmt_create'
  })
  gmtCreate: string;

  @Column({
    type: DataType.DATE(3),
    allowNull: false,
    comment: "modified time",
    field: 'gmt_modified'
  })
  gmtModified: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    comment: "package name"
  })
  name: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: "package version, \"*\" meaning all versions"
  })
  version: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "block reason"
  })
  reason: string;
}