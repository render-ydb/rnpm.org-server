import { Provide, Inject } from "@midwayjs/core";
import appConfig = require("../appConfig");
// import logger = require("../common/logger");
const version = require("../../package.json").version;
// import { RedisService } from '@midwayjs/redis';
import { ResigtryTotalService } from "../registry/total.service";
import { Context } from '@midwayjs/koa';
import { UtilService } from "./util.service";


const startTime = '' + Date.now();
let cache = null;
// const cacheKey = 'registry_total';

@Provide()
export class TotalService {

    @Inject()
    ctx: Context;


    @Inject()
    resigtryTotalService: ResigtryTotalService;

    // @Inject()
    // redisService: RedisService;


    @Inject()
    utilService: UtilService

    async showTotal() {
        // return await this.resigtryTotalService.get()
        if (cache && Date.now() - cache.cache_time < 120000) {
            return cache
        }

        // if (appConfig.redisCache) {
        //     const result = await this.redisService.get(cacheKey);
        //     return result;
        // }
        if (cache) {
            // set cache_time fisrt, avoid query in next time
            cache.cache_time = Date.now();
        }

        const total = await this.resigtryTotalService.get();
        const download = await this.utilService.getDownloadTotal();

        total.download = download;
        total.db_name = appConfig.database;
        total.instance_start_time = startTime;
        total.node_version = process.version;
        total.app_version = version;
        total.donate = 'https://xxxxxx';
        total.sync_model = appConfig.syncModel;

        cache = total;
        cache.cache_time = Date.now();
        return JSON.stringify(total,null,2);
    }
}