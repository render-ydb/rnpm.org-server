import { Column, DataType, Table, Model } from 'sequelize-typescript';
import jsonParser = require('../utils/jsonParser');

@Table({
  tableName: 'module_unpublished',
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
export class ModuleUnpublishedEntity extends Model {
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
    comment: "module name",
    unique: "uk_name"
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "base info: tags, time, maintainers, description, versions",
    get: jsonParser.JSONGetter('package'),
    set: jsonParser.JSONSetter('package'),
  })
  package: string;
}