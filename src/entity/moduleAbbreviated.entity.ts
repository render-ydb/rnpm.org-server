import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'module_abbreviated',
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
  ]
})
export class ModuleAbbreviatedEntity extends Model {
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
    type: DataType.STRING(30),
    allowNull: false,
    comment: "module version"
  })
  version: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "the abbreviated metadata"
  })
  package: string;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: true,
    comment: "the publish time",
    field: 'publish_time'
  })
  publishTime: number;
}