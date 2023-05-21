import { Inject, Controller, Put, Body, Get, Query } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';
import { AddUserService } from '../registry/user/add.service';
import { TotalService } from '../service/total.service';
import { UserDTO } from '../dto/user.dto';
import { ListAllService } from '../registry/package/list_all.service';
import { ChangeService } from '../registry/package/change.service';
import { ListSinceService } from '../service/list_since.service';
import { ListShortsService } from '../registry/package/list_shorts';
import { ListVersionsService } from '../registry/package/list_versions';




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
  changeService: ChangeService;

  @Inject()
  listSinceService: ListSinceService;

  @Inject()
  listShortsService: ListShortsService;

  @Inject()
  listVersionsService:ListVersionsService


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

  @Get('/-/short')
  async listShorts(@Query() query) {
    return await this.listShortsService.listShorts(query);
  }

  @Get('/-/allversions')
  async allversions(@Query() query) {
    return await this.listVersionsService.allversions(query);
  }

  


  @Put('/-/user/org.couchdb.user:name', {
    summary: 'npm客户端用户登录'
  })
  async createUser(@Body() body: UserDTO) {
    return await this.addUser.createNewUser(body)
  }
}
