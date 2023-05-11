import { Provide } from '@midwayjs/core';
import { Config, ALL } from '@midwayjs/core';


@Provide()
export class UserService {

  @Config(ALL)
  appConifg;


  async auth(userName: string, password: string) {
    // TODO
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
