import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'module',
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
      name: "uk_name",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "name" },
        { name: "version" },
      ]
    },
    {
      name: "idx_gmt_modified",
      using: "BTREE",
      fields: [
        { name: "gmt_modified" },
      ]
    },
    {
      name: "idx_publish_time",
      using: "BTREE",
      fields: [
        { name: "publish_time" },
      ]
    },
    {
      name: "idx_author",
      using: "BTREE",
      fields: [
        { name: "author" },
      ]
    },
    {
      name: "idx_name_gmt_modified",
      using: "BTREE",
      fields: [
        { name: "name" },
        { name: "gmt_modified" },
      ]
    },
  ]
})
export class ModuleEntity extends Model {
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
    type: DataType.STRING(100),
    allowNull: false,
    comment: "module author"
  })
  author: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    comment: "module name"
  })
  name: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: "module version"
  })
  version: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "module description"
  })
  description: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "package.json"
  })
  package: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: "module dist SHASUM",
    field: 'dist_shasum'
  })
  distShasum: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    comment: "module dist tarball",
    field: 'dist_tarball'
  })
  distTarball: string;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "module dist size",
    field: 'dist_size'
  })
  distSize: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: true,
    comment: "module publish time",
    field: 'publish_time'
  })
  publishTime: number;
}