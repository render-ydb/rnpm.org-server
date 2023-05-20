import { Inject, Provide } from "@midwayjs/core";
import path = require("path");
import fs = require("fs");
import utility = require("utility");
import appConfig = require("../appConfig");
import ms = require("humanize-ms");
import moment = require("moment");
import { DownloadTotalService } from "./download_total_service";
import { Json } from "../interface";
const rimraf = require("rimraf");
const nfs = appConfig.nfs;
const DOWNLOAD_TIMEOUT = ms('10m');

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

    setLicense(pkg: Json) {
        let license;
        license = pkg.license || pkg.licenses || pkg.licence || pkg.licences;
        if (!license) {
            return;
        }

        if (Array.isArray(license)) {
            license = license[0];
        }

        if (typeof license === 'object') {
            pkg.license = {
                name: license.name || license.type,
                url: license.url
            };
        }

        if (typeof license === 'string') {
            if (license.match(/(http|https)(:\/\/)/ig)) {
                pkg.license = {
                    name: license,
                    url: license
                };
            } else {
                pkg.license = {
                    url: this.getOssLicenseUrlFromName(license),
                    name: license
                };
            }
        }
    };

    getOssLicenseUrlFromName(name: string) {
        const base = 'http://opensource.org/licenses/';

        const licenseMap = {
            'bsd': 'BSD-2-Clause',
            'mit': 'MIT',
            'x11': 'MIT',
            'mit/x11': 'MIT',
            'apache 2.0': 'Apache-2.0',
            'apache2': 'Apache-2.0',
            'apache 2': 'Apache-2.0',
            'apache-2': 'Apache-2.0',
            'apache': 'Apache-2.0',
            'gpl': 'GPL-3.0',
            'gplv3': 'GPL-3.0',
            'gplv2': 'GPL-2.0',
            'gpl3': 'GPL-3.0',
            'gpl2': 'GPL-2.0',
            'lgpl': 'LGPL-2.1',
            'lgplv2.1': 'LGPL-2.1',
            'lgplv2': 'LGPL-2.1'
        };

        return licenseMap[name.toLowerCase()] ?
            base + licenseMap[name.toLowerCase()] : base + name;
    };

    ensureSinceIsDate(since: Date) {
        if (!(since instanceof Date)) {
            return new Date(Number(since));
        }
        return since;
    }

    async downloadAsReadStream(key: string) {
        const options = { timeout: DOWNLOAD_TIMEOUT };
        if (nfs.createDownloadStream) {
            return await nfs.createDownloadStream(key, options);
        }

        const tmpPath = path.join(appConfig.uploadDir,
            utility.randomString() + key.replace(/\//g, '-'));
        let tarball;
        function cleanup() {
            rimraf(tmpPath, utility.noop);
            if (tarball) {
                tarball.destroy();
            }
        }

        try {
            await nfs.download(key, tmpPath, options);
        } catch (err) {
            cleanup();
            throw err;
        }
        tarball = fs.createReadStream(tmpPath);
        tarball.once('error', cleanup);
        tarball.once('end', cleanup);
        return tarball;
    }
}

// 明天看看整体total的整体逻辑，数据表的结构、在进行totalservice的合并，哈哈