import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'module_star',
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
      name: "uk_user_module_name",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "user" },
        { name: "name" },
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
export class ModuleStarEntity extends Model {
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
    comment: "user name"
  })
  user: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    comment: "module name"
  })
  name: string;
}