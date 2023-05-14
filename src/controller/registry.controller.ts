import { Inject, Controller, Put, Body, Get } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';
import { AddUserService } from '../registry/user/add.service';
import { TotalService } from '../service/total.service';
import { UserDTO } from '../dto/user.dto';


@ApiTags(['registry'])
@Controller('/')
export class RegistryController {
  @Inject()
  ctx: Context;

  @Inject()
  addUser: AddUserService

  @Inject()
  totalService: TotalService


  @Get('/',{
    summary:'显示所有数据'
  })
  async root(){
    return await this.totalService.showTotal()
  }

  @Put('/-/user/org.couchdb.user:name',{
    summary:'npm客户端用户登录'
  })
  async createUser(@Body() body: UserDTO) {
    return await this.addUser.createNewUser(body)
  }
}
