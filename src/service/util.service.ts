import { Inject, Provide } from "@midwayjs/core";
// import path = require("path");
// import fs = require("fs");
// import utility = require("utility");
// import appConfig = require("../appConfig");
// import ms = require("humanize-ms");
// import rimraf = require("rimraf");
import moment = require("moment");
import { DownloadTotalService } from "./download_total_service";



@Provide()
export class UtilService {

    @Inject()
    downloadTotalService: DownloadTotalService;

    async getDownloadTotal(name?: string) {
        let end: string | moment.Moment = moment();
        // 获取上个月的第一天
        let start: string | moment.Moment = end.clone().subtract(1, 'months').startOf('month');
        // 得到昨天日期字符串YYYY-MM-DD
        const lastday = end.clone().subtract(1, 'days').format('YYYY-MM-DD');
        // 得到上周的周一开始时间
        let lastweekStart: string | moment.Moment = end.clone().subtract(1, 'weeks').startOf("isoWeek");
        // 上周日的日期字符串YYYY-MM-DD
        const lastweekEnd = lastweekStart.clone().endOf("isoWeek").format('YYYY-MM-DD');
        // 上月最后一天的日期字符串YYYY-MM-DD
        const lastmonthEnd = start.clone().endOf('month').format('YYYY-MM-DD');
        // 这个月的开始日期字符串YYYY-MM-DD
        const thismonthStart = end.clone().startOf('month').format('YYYY-MM-DD');
        // 这周开始的日期字符串YYYY-MM-DD
        const thisweekStart = end.clone().startOf("isoWeek").format('YYYY-MM-DD');
        start = start.format('YYYY-MM-DD');
        end = end.format('YYYY-MM-DD');
        lastweekStart = lastweekStart.format('YYYY-MM-DD');
        const method = name ? 'getModuleTotal' : 'getTotal';
        const args = [start, end];
        if (name) {
            args.unshift(name)
        }

        const rows = this.downloadTotalService[method].apply(this.downloadTotalService, args);
        const download = {
            today: 0,
            thisweek: 0,
            thismonth: 0,
            lastday: 0,
            lastweek: 0,
            lastmonth: 0,
            total: 0,
        }
        for (let i = 0; i < rows.length; i++) {
            let r = rows[i];
            if (r.date === end) {
                download.today += r.count;
            }
            if (r.date >= thismonthStart) {
                download.thismonth += r.count;
            }
            if (r.date >= thisweekStart) {
                download.thisweek += r.count;
            }

            if (r.date === lastday) {
                download.lastday += r.count;
            }
            if (r.date >= lastweekStart && r.date <= lastweekEnd) {
                download.lastweek += r.count;
            }
            if (r.date >= start && r.date <= lastmonthEnd) {
                download.lastmonth += r.count;
            }
        }

        if (name) {
            download.total = await this.downloadTotalService.getTotalByName(name);

        }
        return download;
    }
}