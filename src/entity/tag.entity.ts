import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'tag',
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
        { name: "tag" },
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
export class TagEntity extends Model {
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
    comment: "tag name"
  })
  tag: string;

  @Column({
    type: DataType.STRING(30),
    allowNull: false,
    comment: "module version"
  })
  version: string;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    comment: "module id",
    field: 'module_id'
  })
  moduleId: number;
}