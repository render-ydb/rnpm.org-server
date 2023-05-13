import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserBaseInfo } from '../../interface';
import { UserService } from '../../service/user.service';
import { TokenService } from '../../service/token.service';
import ensurePasswordSalt = require('../../utils/ensurePasswordSalt');


@Provide()
export class AddUserService {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService

  @Inject()
  tokenService: TokenService

  /**
    * @description create a new user
    * https://registry.npmjs.org/-/user/org.couchdb.user:render
   */
  async index(body: UserBaseInfo) {
    console.log("body", body)
    body = body || {} as UserBaseInfo;
    // console.log(useConfig());
    const { name, password } = body;
    if (!password || !name) {
      this.ctx.status = 422;
      const error = '[param_error] params missing, name, email or password missing';
      return {
        error,
        reason: error,
      }
    }
    let loginedUser;
    try {
      loginedUser = await this.userService.authAndSave(name, password);
      console.log(loginedUser);
    } catch (err) {
      this.ctx.status = err.status || 500;
      return {
        error: err.message,
        reason: err.message,
      }
    }

    if (loginedUser) {
      const token = await this.tokenService.createToken(body.name, {
        readonly: !!body.readonly,
        cidrWhitelist: body.cidr_whitelist || [],
      });
      this.ctx.status = 201;
      return {
        token: token.token,
        ok: true,
        id: 'org.couchdb.user:' + loginedUser.login,
        rev: Date.now() + '-' + loginedUser.login
      };
    }

    const user = {
      name: body.name,
      salt: body.salt,
      password_sha: body.password_sha,
      email: body.email,
      ip: this.ctx.ip || '0.0.0.0',
      roles: body.roles || [],
    };
    ensurePasswordSalt(user, body);

    if (!user.salt || !user.password_sha || !user.email) {
      this.ctx.status = 422;
      const error = '[param_error] params missing, name, email or password missing';
      return {
        error,
        reason: error,
      };
    }

    const existUser = await this.userService.get(name);
    if (existUser) {
      this.ctx.status = 409;
      const error = '[conflict] User ' + name + ' already exists';
      return {
        error,
        reason: error,
      };
    }

    // add new user
    const result = await this.userService.add(user);
    this.ctx.set('etag', '"' + result.rev + '"');

    const token = await this.tokenService.createToken(body.name, {
      readonly: !!body.readonly,
      cidrWhitelist: body.cidr_whitelist || [],
    });
    this.ctx.status = 200;
    console.log("jieguo", {
      token: token.token,
      ok: true,
      id: 'org.couchdb.user:' + name,
      rev: result.rev
    })
    return {
      token: token.token,
      ok: true,
      id: 'org.couchdb.user:' + name,
      rev: result.rev
    }
  }

}
