import { Catch, httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    // 不能直接全部转到404，不然npm login/ npm adduserz中用到的/-/v1/login
    // 会被重定向
    // 后续考虑用中间件正则匹配特定的路由进行重定向
    // ctx.redirect('/404.html');
  }
}
