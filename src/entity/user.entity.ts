import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'user',
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
export class UserEntity extends Model {
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
    comment: "user name",
    unique: "uk_name"
  })
  name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: "user salt"
  })
  salt: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: "user password hash",
    field: 'password_sha'
  })
  passwordSha: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    comment: "user last request ip"
  })
  ip: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    defaultValue: "[]",
    comment: "user roles"
  })
  roles: string;

  @Column({
    type: DataType.STRING(40),
    allowNull: false,
    comment: "user rev"
  })
  rev: string;

  @Column({
    type: DataType.STRING(400),
    allowNull: false,
    comment: "user email"
  })
  email: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: "json details"
  })
  json: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: 0,
    comment: "user sync from npm or not, 1: true, other: false",
    field: 'npm_user'
  })
  npmUser: boolean;
}