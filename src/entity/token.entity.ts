import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'token',
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
      name: "uk_token",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "token" },
      ]
    },
    {
      name: "idx_user",
      using: "BTREE",
      fields: [
        { name: "user_id" },
      ]
    },
  ]
})
export class TokenEntity extends Model {
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
    comment: "token",
    unique: "uk_token"
  })
  token: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    comment: "user name",
    field: 'user_id'
  })
  userId: string;

  @Column({
    type: DataType.TINYINT,
    allowNull: false,
    defaultValue: 0,
    comment: "readonly or not, 1: true, other: false"
  })
  readonly: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    comment: "token sha512 hash",
    field: 'token_key'
  })
  tokenKey: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
    comment: "ip list, [\"127.0.0.1\"]",
    field: 'cidr_whitelist'
  })
  cidrWhitelist: string;
}