import { Catch, httpError, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Catch(httpError.NotFoundError)
export class NotFoundFilter {
  async catch(err: MidwayHttpError, ctx: Context) {
    // 404 错误会到这里
    console.log(ctx.request.url);
    console.log(/^\/(@[\w\-\.]+\/[\w\-\.]+)\/([\w\-\.]+)$/.test(ctx.request.url))
    ctx.redirect('/404.html');
  }
}
