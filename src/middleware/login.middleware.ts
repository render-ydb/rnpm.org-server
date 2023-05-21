import { Middleware, IMiddleware } from '@midwayjs/core';
import { NextFunction } from '@midwayjs/koa';
import { AppContext } from '../interface';
import http = require('http');

@Middleware()
export class LoginMiddleware implements IMiddleware<AppContext, NextFunction> {
    resolve() {
        return async (ctx: AppContext, next: NextFunction) => {
            const { path, query, user } = ctx;
            if (path === '/-/ping' && query.write !== 'true') {
                return await next();
            }
            if (user.error) {
                // @ts-ignore
                const status = user.error.status;
                ctx.status = http.STATUS_CODES[status]
                    ? status
                    : 500;

                const error = `[${user.error.name}] ${user.error.message}`;
                return {
                    error,
                    reason: error,
                }
            }
            if (!user.name) {
                ctx.status = 401;
                const error = '[unauthorized] Login first';
                return {
                    error,
                    reason: error,
                }
            }

            await next()

        };
    }

    static getName(): string {
        return 'login';
    }
}
