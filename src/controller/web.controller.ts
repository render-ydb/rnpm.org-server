import { Controller, Get, Put,Inject, Param, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';

@ApiTags(['web'])
@Controller('/')
export class WebController {

  @Inject()
  ctx: Context;



  @Put('/:name')
  async publishPkg(@Param('name') name:string,@Body() body:any){
    this.ctx.status = 200;
    console.log(body);
    this.ctx.body = {
      ok: true,
      rev: '测试'
    };
  }

  @Get(/^\/(@[\w\-\.]+\/[\w\-\.]+)\/([\w\-\.]+)$/)
  async test(): Promise<string> {
    return 'render!';
  }
  @Get('/404.html')
  async get_404(): Promise<string> {
    return '404.html!';
  }
}
