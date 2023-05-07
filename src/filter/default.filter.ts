import { Catch } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

// capture all uncalssified errors
@Catch()
export class DefaultErrorFilter {
  async catch(err: Error, ctx: Context) {
    return {
      success: false,
      message: err.message,
    };
  }
}
