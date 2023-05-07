import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'module_keyword',
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
      name: "uk_keyword_module_name",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "keyword" },
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
export class ModuleKeywordEntity extends Model {
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
    type: DataType.STRING(100),
    allowNull: false,
    comment: "keyword"
  })
  keyword: string;

  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    comment: "module name"
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "module description"
  })
  description: string;
}