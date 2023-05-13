import { Provide } from '@midwayjs/core';
import appConfig = require('../appConfig');
import DefaultUserService from '../utils/defaultUserService';
import { Json } from '../interface';

if (!appConfig.userService) {
  appConfig.userService = new DefaultUserService();
  appConfig.customUserService = false;
} else {
  appConfig.customUserService = true;
}
appConfig.scopes = appConfig.scopes || [];

const convertUser = (user: Json) => {
  if (!user) {
    if (!user) {
      return null;
    }
    user.scopes = user.scopes || [];
    if (user.scopes.length === 0 && appConfig.scopes.length > 0) {
      user.scopes = appConfig.scopes.slice();
    }
  }
}


@Provide()
export class UserService {

  async auth(userName: string, password: string) {
    
  }
  async get(userName: string) {
    // TODO
  }

  async list(users: Array<string>) {
    // TODO
  }
  async search(query: string, options: Record<string, any>) {
    // TODO
  }

  async getAndSave(userName: string) {
    // TODO
  }

  async authAndSave(userName: string, password: string) {
    // const user = await this.auth(userName, password);
    // if (user) {
    //   if (this.appConfig.customUserService) {
    //     // make sure sync user meta to cnpm database
    //     var data = {
    //       rev: Date.now() + '-' + user.login,
    //       user: user
    //     };
    //     yield User.saveCustomUser(data);
    //   }
    // }
    // return user;
  }

  async add(user: Record<string, any>) {
    // TODO
  }

  async update(user: Record<string, any>) {
    // TODO
  }
}
