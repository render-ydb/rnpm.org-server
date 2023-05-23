import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction } from '@midwayjs/koa';
import { AppContext } from '../interface';
import appConfig = require('../appConfig');
import { PackageService } from '../service/package.service';
import util = require("util");


const checkScope = (name: string, ctx: AppContext) => {
  if (!ctx.user.scopes || !ctx.user.scopes.length) {
    ctx.status = 404;
    return false;
  }

  const scope = name.split('/')[0];
  if (ctx.user.scopes.indexOf(scope) === -1) {
    ctx.status = 400;
    const error = util.format('[invalid] scope %s not match legal scopes: %s', scope, ctx.user.scopes.join(', '));
    ctx.body = {
      error,
      reason: error,
    };
    return false;
  }

  return true;
}

const assertNoneScope = (ctx: AppContext) => {
  ctx.status = 403;
  if (ctx.user.scopes.length === 0) {
    const error = '[no_perms] can\'t publish non-scoped package, please set `config.scopes`';
    ctx.body = {
      error,
      reason: error,
    };
  }

  const error = '[no_perms] only allow publish with ' + ctx.user.scopes.join(', ') + ' scope(s)';
  ctx.body = {
    error,
    reason: error,
  };
}

@Middleware()
export class PublishableMiddleware implements IMiddleware<AppContext, NextFunction> {
  resolve() {
    return async (ctx: AppContext, next: NextFunction) => {
      const { user } = ctx;

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

      const packageService = await ctx.requestContext.getAsync<PackageService>(PackageService);
      const result = await packageService.authMaintainer(name, user.name);
      if (result.maintainers && result.maintainers.length) {
        if (result.isMaintainer) {
          return await next();
        }
        ctx.status = 403;
        const error = '[forbidden] ' + user.name + ' not authorized to modify ' + name +
          ', please contact maintainers: ' + result.maintainers.join(', ');
        return {
          error,
          reason: error,
        };
      }

      // scoped module
      if (name[0] === '@') {
        if (checkScope(name, ctx)) {
          return await next();
        }
        return;
      }

      // none-scope
      assertNoneScope(ctx);

    };
  }

  static getName(): string {
    return 'publishable';
  }
}
