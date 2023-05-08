import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { IUserBaseInfo } from '../../interface';

@Provide()
export class AddUserService {
  @Inject()
  ctx: Context;
  /**
    * @description create a new user
    * https://registry.npmjs.org/-/user/org.couchdb.user:render
   */
  async index(body: IUserBaseInfo) {
    body =body || {} as IUserBaseInfo;
    console.log(body);
    const name = body.name;
    if (!body.password || !name) {
      this.ctx.status = 422;
      const error = '[param_error] params missing, name, email or password missing';
      return {
        error,
        reason: error,
      }
    }
   
    return {
      username: 'kkkk'
    }
  }

}
