import { Context } from "koa";
import { Total } from '../models';
import { QueryTypes, Sequelize } from "sequelize";
import { TotalEntity } from "../entity/total.entity";
import appConfig = require("../appConfig");
import { Inject, Provide } from "@midwayjs/core";


// 选取module表中name列中 不重复值的数量，并将其命名为count
const TOTAL_MODULE_SQL = 'SELECT count(distinct(name)) AS count FROM module;';
// 选取module表中name列的数量，并将其命名为count
const TOTAL_VERSION_SQL = 'SELECT count(name) AS count FROM module;';
const TOTAL_USER_SQL = 'SELECT count(name) AS count FROM user;';
// 根据视图查找所有表的索引长度总和、所有表占用的存储空间
const DB_SIZE_SQL = `
SELECT TABLE_NAME AS name, data_length, index_length 
FROM information_schema.tables WHERE TABLE_SCHEMA = '${appConfig.database}'
ORDER BY data_length DESC
LIMIT 0, 200;
`;

interface Count {
    count: number
}

interface Size {
    name: string;
    index_length: number;
    data_length: number;
}

@Provide()
export class ResigtryTotalService {

    @Inject()
    ctx:Context

    async get() {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const sizes = await globalSequlize.query<Size>(DB_SIZE_SQL, { type: QueryTypes.SELECT })
        const mc = (await globalSequlize.query<Count>(TOTAL_MODULE_SQL, { type: QueryTypes.SELECT }))[0] as unknown as Count;
        const vc = (await globalSequlize.query<Count>(TOTAL_VERSION_SQL, { type: QueryTypes.SELECT }))[0] as unknown as Count;
        const uc = (await globalSequlize.query<Count>(TOTAL_USER_SQL, { type: QueryTypes.SELECT }))[0] as unknown as Count;
        const info = await this.getTotalInfo() || {} as TotalEntity;
        if (typeof info.moduleDelete === 'string') {
            info.moduleDelete = Number(info.moduleDelete)
        }
        console.log("mc", mc);
        console.log("vc", vc)
        console.log("uc", uc)
        console.log("info", info);
        console.log("sizes", sizes[0])
        const total = {
            data_tables: {},
            disk_size: 0,
            data_size: 0,
            index_size: 0,
            disk_format_version: 0,
            committed_update_seq: 0,
            update_seq: 0,
            purge_seq: 0,
            compact_running: false,
            doc_count: mc.count,
            doc_del_count: info.moduleDelete || 0,
            doc_version_count: vc.count,
            user_count: uc.count,
            store_engine: 'mysql',
            sync_status: info.syncStatus,
            need_sync_num: info.needSyncNum || 0,
            success_sync_num: info.successSyncNum || 0,
            fail_sync_num: info.failSyncNum || 0,
            last_sync_time: info.lastSyncTime || 0,
            last_exist_sync_time: info.lastExistSyncTime || 0,
            last_sync_module: info.lastSyncModule || '',
        }

        for (let i = 0; i < sizes.length; i++) {
            const row = sizes[i];
            total.data_tables[row.name] = {
                data_size: row.data_length,
                index_size: row.index_length,
            };
            total.data_size += row.data_length;
            total.index_size += row.index_length;
        }
        total.disk_size = total.data_size + total.index_size;
        return JSON.stringify(total, null, 2)
    }
    async getTotalInfo() {
        const row: TotalEntity = await Total.find({
            where: {
                name: 'total'
            }
        });
        if (row && typeof row.moduleDelete === 'string') {
            row.moduleDelete = Number(row.moduleDelete);
        }
        return row;
    }

    async plusDeleteModule() {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const sql = `UPDATE total SET module_delete=module_delete+1 WHERE name= 'total'`;
        return await globalSequlize.query(sql), { type: QueryTypes.UPDATE };
    };

    async setLastSyncTime(time) {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const sql = 'UPDATE total SET last_sync_time=? WHERE name=\'total\'';
        return await globalSequlize.query(sql, {
            replacements: [time],
            type: QueryTypes.UPDATE
        });
    };

    async setLastExistSyncTime(time) {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const sql = 'UPDATE total SET last_exist_sync_time=? WHERE name=\'total\'';
        return await globalSequlize.query(sql, {
            replacements: [time],
            type: QueryTypes.UPDATE
        });
    };
    async updateSyncStatus(status) {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const sql = 'UPDATE total SET sync_status=? WHERE name=\'total\'';
        return await globalSequlize.query(sql, {
            replacements: [status],
            type: QueryTypes.UPDATE
        });
    };

    async updateSyncNum (params) {
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        const replacements = [
          params.syncStatus,
          params.need || 0,
          params.success || 0,
          params.fail || 0,
          params.left || 0,
          params.lastSyncModule
        ];
        const sql = 'UPDATE total SET \
          sync_status=?, need_sync_num=?, success_sync_num=?, \
          fail_sync_num=?, left_sync_num=?, last_sync_module=? \
          WHERE name=\'total\'';
          return await globalSequlize.query(sql, {
            replacements,
            type: QueryTypes.UPDATE
        });
      };
}
