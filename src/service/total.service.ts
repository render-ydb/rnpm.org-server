import { Provide, Inject } from "@midwayjs/core";
// import appConfig = require("../appConfig");
// import logger = require("../common/logger");
// const version = require("../../package.json").version;
// import { RedisService } from '@midwayjs/redis';
import {ResigtryTotalService}  from "../registry/total.service";
import { Context } from '@midwayjs/koa';


// const startTime = '' + Date.now();
// let cache = null;
// const cacheKey = 'registry_total';

@Provide()
export class TotalService {

    @Inject()
    ctx: Context;


    @Inject()
    resigtryTotalService:ResigtryTotalService
    // @Inject()
    // redisService: RedisService;
    async showTotal() {
        return await this.resigtryTotalService.get()
        // if (cache && Date.now() - cache.cache_time < 120000) {
        //     return cache
        // }

        // if (appConfig.redisCache) {
        //     const result = await this.redisService.get(cacheKey);
        //     return result;
        // }
        // if (cache) {
        //     // set cache_time fisrt, avoid query in next time
        //     cache.cache_time = Date.now();
        // }


    }
}