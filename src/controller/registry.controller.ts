import { Inject, Controller, Put, Body, Get, Query, Param } from '@midwayjs/core';
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
import { LoginMiddleware } from '../middleware/login.middleware';
import { WhoamiService } from '../registry/user/whoami.service';
import { PublishableMiddleware } from '../middleware/publishable.middleware';
import { SaveSerivce } from '../registry/package/save.service';
import { SyncByInstallMiddleware } from '../middleware/sync_by_install.middleware';
import { ListService } from '../registry/package/list.service';






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
  listVersionsService: ListVersionsService;

  @Inject()
  whoamiService: WhoamiService;

  @Inject()
  saveService: SaveSerivce;

  @Inject()
  listService:ListService


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

  @Get('/-/whoami', {
    middleware: [LoginMiddleware]
  })
  async whoami() {
    return await this.whoamiService.userInfo()
  }

  @Get('/-/ping', {
    middleware: [LoginMiddleware]
  })
  async ping() {
    this.ctx.status = 200;
    return {};
  }

  // 上传包
  @Put('/:name', {
    middleware: [
      LoginMiddleware,
      PublishableMiddleware
    ]
  })
  async savePackage(@Param('name') name: string, @Body() body: any) {
    await this.saveService.savePackage(name, body)
  }

  // 获取包的信息
   // module
  // scope package: params: [$name]
  @Get(/^\/(@[\w\-\.]+\/[^\/]+)$/, {
    middleware: [
      SyncByInstallMiddleware
    ]
  })
  async getPackage() {
   
     return await this.listService.listAllVersions()
  }





  @Put('/-/user/org.couchdb.user:name', {
    summary: 'npm客户端用户登录'
  })
  async createUser(@Body() body: UserDTO) {
    return await this.addUser.createNewUser(body)
  }
}
