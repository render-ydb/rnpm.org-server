import { Provide } from "@midwayjs/core";
import ModuleLog = require("../models/module.log");

const MAX_LEN = 50 * 1024;

@Provide()
export class ModuleLogService {
    async create(data: { name: string; username: string }) {
        const row = ModuleLog.model.build({
            name: data.name,
            username: data.username || 'anonymous',
            log: ''
        });
        return await row.save();
    }

    async append(id: number, log:string) {
        if (!log) {
            return null;
          }
        
          var row = await this.get(id);
          if (!row) {
            return null;
          }
        
          if (row.log) {
            row.log += '\n' + log;
          } else {
            row.log = log;
          }
          if (row.log.length > MAX_LEN) {
            // only keep the fisrt 1kb and the last 50kb log string
            row.log = row.log.substring(0, 1024) + '\n... ignore long logs ...\n' + row.log.substring(row.log.length - MAX_LEN);
          }
          return await row.save({
            fields:['log']
          });

    }

    async get(id: number) {
        return await ModuleLog.model.findOne({
            where: {
                id
            }
        })
    }
}