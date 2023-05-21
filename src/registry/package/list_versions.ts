import moment = require('moment');
import { PackageService } from '../../service/package.service';
import { Inject, Provide } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

// GET /-/allversions?date={2020-02-20}
// List all packages versions sync at date(gmt_modified)
@Provide()
export class ListVersionsService {
    @Inject()
    ctx: Context;

    @Inject()
    packageService: PackageService

    async allversions(query) {
        const date = moment(query.date, 'YYYY-MM-DD');
        if (!date.isValid()) {
            this.ctx.status = 400;
            const error = '[query_parse_error] Invalid value for `date`, should be `YYYY-MM-DD` format.';
            return {
                error,
                reason: error,
            };

        }

        const today = date.format('YYYY-MM-DD');
        const rows = await this.packageService.findAllModuleAbbreviateds({
            gmtModified: {
                $gte: `${today} 00:00:00`,
                $lte: `${today} 23:59:59`,
            },
        });
        return rows.map(row => {
            return {
                name: row.name,
                version: row.version,
                publish_time: new Date(row.publishTime),
                gmt_modified: row.gmtModified,
            };
        });
    }
}