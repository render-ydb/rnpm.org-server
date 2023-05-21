import { Middleware, IMiddleware, Inject } from '@midwayjs/core';
import { NextFunction } from '@midwayjs/koa';
import { AppContext, AppUser } from '../interface';
import config = require('../appConfig');
import { getAuthorizeType, AuthorizeType } from '../lib';
import { UserService } from '../service/user.service';
import { TokenService } from '../service/token.service';





@Middleware()
export class AuthMiddleware implements IMiddleware<AppContext, NextFunction> {
  @Inject()
  tokenService:TokenService;

  @Inject()
  userService:UserService

  resolve() {
    return async (ctx: AppContext, next: NextFunction) => {
      ctx.user = {} as AppUser;
      const authorization = (ctx.get('authorization') || '').trim();

      if (!authorization) {
        return await this.unauthorized(ctx, next);
      }

      let row;

      try {
        const authorizeType = getAuthorizeType(ctx);
        if (authorizeType === AuthorizeType.BASIC) {
          row = await this.basicAuth(authorization);
        } else if (authorizeType === AuthorizeType.BEARER) {
          row = await this.bearerAuth(authorization, ctx.method, ctx.ip);
        } else {
          return await this.unauthorized(ctx, next);
        }
      } catch (err) {
        // do not response error here
        // many request do not need login
        console.log(err)
        ctx.user.error = err;
      }
      console.log("row", row)
      if (!row) {

        return await this.unauthorized(ctx, next);
      }
      ctx.user.name = row.login;
      ctx.user.isAdmin = row.site_admin;
      ctx.user.scopes = row.scopes;
      await next();
    };
  }

  async unauthorized(ctx, next) {
    if (!config.alwaysAuth || ctx.method !== 'GET') {
      return await next();
    }
    ctx.status = 401;
    ctx.set('WWW-Authenticate', 'Basic realm="sample"');
    if (ctx.accepts(['html', 'json']) === 'json') {
      const error = '[unauthorized] login first';
      return {
        error,
        reason: error,
      }
    } else {
      return 'login first';
    }
  }

  async bearerAuth(authorization, method, ip) {
    const token = authorization.split(' ')[1];
    const isReadOperation = method === 'HEAD' || method === 'GET';
    return await this.tokenService.validateToken(token, {
      isReadOperation: isReadOperation,
      accessIp: ip,
    });
  }

  async basicAuth(authorization){
    authorization = authorization.split(' ')[1];
    authorization = Buffer.from(authorization, 'base64').toString();
    console.log("authorizationauthorization", authorization)
    var pos = authorization.indexOf(':');
    if (pos === -1) {
      return null;
    }
  
    const username = authorization.slice(0, pos);
    const password = authorization.slice(pos + 1);
    return this.userService.auth(username, password);
  }

  static getName(): string {
    return 'auth';
  }
}
