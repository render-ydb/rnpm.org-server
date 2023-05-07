import { Inject, Controller, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { ApiTags } from '@midwayjs/swagger';

@ApiTags(['registry'])
@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user',{ summary: 'test',description:"获取接口"})
  async getUser(@Query('uid') uid:number) {
    // @Query('uid') uid: number,
    const user = await this.userService.getUser({ uid });
    
    return { success: true, message: 'OK', data: user };
  }
}
