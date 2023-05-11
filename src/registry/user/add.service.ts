import { Provide, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserBaseInfo } from '../../interface';
import { UserService } from '../../service/user.service';


@Provide()
export class AddUserService {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService

  /**
    * @description create a new user
    * https://registry.npmjs.org/-/user/org.couchdb.user:render
   */
  async index(body: UserBaseInfo) {
    
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

    return {
      username: 'kkkk'
    }
  }

}
