import { Catch } from '@midwayjs/core';
import { MidwayValidationError } from '@midwayjs/validate';
import { Context } from '@midwayjs/koa';

@Catch(MidwayValidationError)
export class ValidateErrorFilter {
    async catch(err: MidwayValidationError, ctx: Context) {
        console.error(err);
        return {
            status: 422,
            reason: err,
        };
    }
}