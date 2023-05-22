import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction } from '@midwayjs/koa';
import { AppContext } from '../interface';
import appConfig = require('../appConfig');
import { PackageService } from '../service/package.service';

@Middleware()
export class PublishableMiddleware implements IMiddleware<AppContext, NextFunction> {
  resolve() {
    return async (ctx: AppContext, next: NextFunction) => {
      const { user } = ctx;

      console.log(ctx.params)
      // admins always can publish and unpublish
      if (user.isAdmin) {
        return await next();
      }

      // private mode, normal user can't publish and unpublish
      if (appConfig.enablePrivate) {
        ctx.status = 403;
        const error = '[no_perms] Private mode enable, only admin can publish this module';
        return {
          error,
          reason: error,
        };

      }
      const name = ctx?.params?.name;

      // check if is private package list in config
      if (appConfig.privatePackages && appConfig.privatePackages.indexOf(name) !== -1) {
        return await next();
      }

      const packageService =  await ctx.requestContext.getAsync<PackageService>(PackageService);
      packageService.authMaintainer
      // await next()
    };
  }

  static getName(): string {
    return 'publishable';
  }
}
