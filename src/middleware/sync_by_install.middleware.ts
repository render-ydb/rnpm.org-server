import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction } from '@midwayjs/koa';
import { AppContext } from '../interface';
import appConfig = require('../appConfig');

@Middleware()
export class SyncByInstallMiddleware implements IMiddleware<AppContext, NextFunction> {
  resolve() {
    return async (ctx: AppContext, next: NextFunction) => {
     
      ctx.allowSync = false;
      if (!appConfig.syncByInstall) {
        return await next();
      }
   
      // request not by node, consider it request from web, don't sync
      const ua = ctx.get('user-agent');
      if (!ua || ua.indexOf('node') < 0) {
        return await next();
      }
   
      // if request with `/xxx?write=true`, meaning the read request using for write, don't sync
      if (ctx.query.write) {
        return await next();
      }
      const name = ctx.params.name;
      // private scoped package don't sync
      if (name && name[0] === '@') {
        const scope = name.split('/')[0];
        if (appConfig.scopes.indexOf(scope) >= 0) {
          return await next();
        }
      }

      ctx.allowSync = true;
      await next();

    };
  }

  static getName(): string {
    return 'sync-by-install';
  }
}
