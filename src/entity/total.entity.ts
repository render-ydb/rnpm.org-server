import { Column, DataType, Table, Model } from 'sequelize-typescript';

@Table({
  tableName: 'total',
  timestamps: false,
  paranoid: true,
  indexes: [
    {
      name: "PRIMARY",
      unique: true,
      using: "BTREE",
      fields: [
        { name: "name" },
      ]
    },
  ]
})
export class TotalEntity extends Model {
  @Column({
    type: DataType.STRING(214),
    allowNull: false,
    primaryKey: true,
    comment: "total name"
  })
  name: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: "modified time",
    field: 'gmt_modified'
  })
  gmtModified: string;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "module delete count",
    field: 'module_delete'
  })
  moduleDelete: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "last timestamp sync from official registry",
    field: 'last_sync_time'
  })
  lastSyncTime: number;

  @Column({
    type: DataType.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "last timestamp sync exist packages from official registry",
    field: 'last_exist_sync_time'
  })
  lastExistSyncTime: number;

  @Column({
    type: DataType.TINYINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "system sync from official registry status",
    field: 'sync_status'
  })
  syncStatus: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "how many packages need to be sync",
    field: 'need_sync_num'
  })
  needSyncNum: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "how many packages sync success at this time",
    field: 'success_sync_num'
  })
  successSyncNum: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "how many packages sync fail at this time",
    field: 'fail_sync_num'
  })
  failSyncNum: number;

  @Column({
    type: DataType.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    comment: "how many packages left to be sync",
    field: 'left_sync_num'
  })
  leftSyncNum: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    comment: "last sync success module name",
    field: 'last_sync_module'
  })
  lastSyncModule: string;
}