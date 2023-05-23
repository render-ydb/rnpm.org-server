import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'module_deps',
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
      name: "uk_name_deps",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "name" },
        { name: "deps" },
      ]
    },
    {
      name: "idx_name",
      using: "BTREE",
      fields: [
        { name: "name" },
      ]
    },
  ]
})
export class ModuleDepsEntity extends Model {
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
    type: DataType.STRING(214),
    allowNull: false,
    comment: "which module depend on this module"
  })
  deps: string;
}