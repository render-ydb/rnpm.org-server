'use strict';

import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "./package.service";
import { Context } from "@midwayjs/koa";

const A_WEEK_MS = 3600000 * 24 * 7;
const TWA_DAYS_MS = 3600000 * 24 * 2;

// GET /-/all/since?stale=update_after&startkey={key}
// List packages names since startkey
// https://github.com/npm/npm-registry-client/blob/master/lib/get.js#L89

@Provide()
export class ListSinceService{
    @Inject()
    ctx:Context

    @Inject()
    packageService:PackageService
    async listSince(query){
        console.log("query",query)
        let {stale,startkey} = query;
        if (stale !== 'update_after') {
          this.ctx.status = 400;
          const error = '[query_parse_error] Invalid value for `stale`.';
          return  {
            error,
            reason: error,
          }
        }
      
         startkey = Number(startkey);
        if (!startkey) {
          this.ctx.status = 400;
          const error = '[query_parse_error] Invalid value for `startkey`.';
          return  {
            error,
            reason: error,
          }
        }
      
        const updated = Date.now();
        if (updated - startkey > A_WEEK_MS) {
          startkey = updated - TWA_DAYS_MS;
          console.warn('[%s] list modules since time out of range: query: %j, ip: %s, limit to %s',
            Date(), query, this.ctx.ip, startkey);
        }
      
        const names = await this.packageService.listPublicModuleNamesSince(startkey);
        const result = { _updated: updated };
        names.forEach(function (name) {
          result[name] = true;
        });
      
        return result;
    }
}
