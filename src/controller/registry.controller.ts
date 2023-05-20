import { Inject, Controller, Put, Body, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';
import { AddUserService } from '../registry/user/add.service';
import { TotalService } from '../service/total.service';
import { UserDTO } from '../dto/user.dto';
import { ListAllService } from '../registry/package/list_all.service';
import { ChangeService } from '../registry/package/change.service';
import { ListSinceService } from '../service/list_since.service';



@ApiTags(['registry'])
@Controller('/')
export class RegistryController {
  @Inject()
  ctx: Context;

  @Inject()
  addUser: AddUserService


  @Inject()
  totalService: TotalService;

  @Inject()
  listAllService: ListAllService;

  @Inject()
  changeService:ChangeService;

  @Inject()
  listSinceService:ListSinceService


  @Get('/', {
    summary: '显示所有数据'
  })
  async root() {
    return await this.totalService.showTotal()
  }

  @Get('/-/all', {
    summary: '获取所有公共模块'
  })
  async listAll() {
    return await this.listAllService.listAll()
  }

  @Get('/-/all/changes')
  async changes(@Query() query) {
    return await this.changeService.listSince(query);
  }

  @Get('/-/all/since')
  async listSince(@Query() query) {
    return await this.listSinceService.listSince(query);
  }

  @Put('/-/user/org.couchdb.user:name', {
    summary: 'npm客户端用户登录'
  })
  async createUser(@Body() body: UserDTO) {
    return await this.addUser.createNewUser(body)
  }
}
