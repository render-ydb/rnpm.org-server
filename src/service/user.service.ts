import { Provide } from '@midwayjs/core';
// import { IUserOptions } from '../interface';

@Provide()
export class UserService {

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
    // TODO
  }

  async add(user: Record<string, any>) {
    // TODO
  }

  async update(user: Record<string, any>) {
    // TODO
  }
}
