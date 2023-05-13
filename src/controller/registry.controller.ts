import { Inject, Controller, Put, Body} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ApiTags } from '@midwayjs/swagger';
import {AddUserService} from '../registry/user/add.service'
import { UserDTO } from '../dto/user.dto';


@ApiTags(['registry'])
@Controller('/')
export class RegistryController {
  @Inject()
  ctx: Context;

  @Inject()
  addUser: AddUserService

 
  @Put('/-/user/org.couchdb.user:name')
  async createUser(@Body() body:UserDTO) {
    return await this.addUser.index(body)
  }
}
