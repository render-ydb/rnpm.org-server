import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

const requests = Symbol('requests');
@Middleware()
export class MaxRequestsMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const socket = ctx.socket;
      if (!socket) {
        return await next();
      }
      socket[requests] = (socket[requests] || 0) + 1;
      ctx.set('X-Current-Requests', socket[requests]);
      if (socket[requests] >= 1000) {
        ctx.set('Connection', 'close');
      }
      await next();
    };
  }

  static getName(): string {
    return 'max-requests';
  }
}
