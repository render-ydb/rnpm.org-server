import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction, Context } from '@midwayjs/koa';

// 防止ruby爬虫
@Middleware()
export class BlockMiddleware implements IMiddleware<Context, NextFunction> {
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            const ua = String(ctx.get('user-agent')).toLowerCase();
            console.log("ua", ua);
            if (ua && ua.includes('ruby')) {
                ctx.status = 403;
                return {
                    message: 'forbidden Ruby user-agent, ip: ' + ctx.ip
                }
            }
            await next();
        };
    }

    static getName(): string {
        return 'block';
    }
}
