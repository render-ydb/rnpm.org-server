import { Inject, Controller, Put, Body} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';
import {AddUserService} from '../registry/user/add.service'
import { IUserBaseInfo } from '../interface';

@ApiTags(['registry'])
@Controller('/')
export class RegistryController {
  @Inject()
  ctx: Context;

  @Inject()
  addUser: AddUserService

 
  @Put('/-/user/org.couchdb.user:name')
  async createUser(@Body() body:IUserBaseInfo) {
    return await this.addUser.index(body)
  }
}
