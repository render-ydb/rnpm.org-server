import utility = require("utility");
import { DownloadTotal } from '../models';
import { Inject, Provide } from "@midwayjs/core";
import { Json } from "../interface";
import { Context } from "koa";
import { QueryTypes, Sequelize } from "sequelize";

const parseYearMonth = (date: string) => {
    return Number(date.substring(0, 7).replace('-', ''));
}


const formatRows = (rows: Array<Json>, startDate: string, endDate: string) => {
    const dates = [];
    rows.forEach(function (row) {
        const date = String(row.date);
        const month = date.substring(4, 6);
        const year = date.substring(0, 4);
        const yearMonth = year + '-' + month;
        for (let i = 1; i <= 31; i++) {
            let day = i < 10 ? '0' + i : String(i);
            let field = 'd' + day;
            let d = yearMonth + '-' + day;
            let count = row[field];
            if (typeof count === 'string') {
                count = utility.toSafeNumber(count);
            }
            if (count > 0 && d >= startDate && d <= endDate) {
                dates.push({
                    name: row.name,
                    count: count,
                    date: d
                });
            }
        }
    });
    return dates;
}

@Provide()
export class DownloadTotalService {

    @Inject()
    ctx: Context

    async getModuleTotal(name: string, start: string, end: string) {
        const startMonth = parseYearMonth(start);
        const endMonth = parseYearMonth(end);
        const rows = await DownloadTotal.findAll({
            where: {
                date: {
                    gte: startMonth,
                    lte: endMonth
                },
                name: name
            }
        });
        return formatRows(rows, start, end);
    };

    async getTotalByName(name: string) {
        var rows = await DownloadTotal.findAll({
            where: {
                name: name
            }
        });
        let count = 0;
        rows.forEach(function (row) {
            for (let i = 1; i <= 31; i++) {
                const day = i < 10 ? '0' + i : String(i);
                const field = 'd' + day;
                let val = row[field];
                if (typeof val === 'string') {
                    val = utility.toSafeNumber(val);
                }
                count += val;
            }
        });
        return count;
    };

    async plusModuleTotal(data) {
        const yearMonth = parseYearMonth(data.date);
        let row = await DownloadTotal.findOne({
            where: {
                name: data.name,
                date: yearMonth,
            }
        });
        if (!row) {
            row = DownloadTotal.build({
                name: data.name,
                date: yearMonth,
            });
            await row.save();
        }
        const field = 'd' + data.date.substring(8, 10);
        const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
        await globalSequlize.query(`UPDATE downloads SET ${field} = ${field} + ${data.count}, gmt_modified=? WHERE id = ?`, {
            replacements: [new Date(), row.id],
            type: QueryTypes.UPDATE
        });
        return row;
    };

    async getTotal(start: string, end: string) {
        return this.getModuleTotal('__all__', start, end);
    };
}