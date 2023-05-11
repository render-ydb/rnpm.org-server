import gravatar = require('gravatar');
import { isAdmin } from '../lib';
import appConfig = require('../appConfig');
import { User } from '../models';
import { UserEntity } from '../entity/user.entity';

// 转化用户信息
const convertToUser = (row: UserEntity) => {
  let user = {
    login: row.name,
    email: row.email,
    name: row.name,
    html_url: 'http://cnpmjs.org/~' + row.name,
    avatar_url: '',
    im_url: '',
    site_admin: isAdmin(row.name),
    scopes: appConfig.scopes,
  };
  try {
    if (row.json) {
      const data = JSON.parse(row.json)
      if (data.login) {
        // custom user
        user = data;
      } else {
        // npm user
        if (data.avatar) {
          user.avatar_url = data.avatar;
        }
        if (data.fullname) {
          user.name = data.fullname;
        }
        if (data.homepage) {
          user.html_url = data.homepage;
        }
        if (data.twitter) {
          user.im_url = 'https://twitter.com/' + data.twitter;
        }
      }
    }
  } catch {

  }
  if (!user.avatar_url) {
    user.avatar_url = gravatar.url(user.email, { s: '50', d: 'retro' }, true);
  }
  return user;
}

export default class DefaultUserService {
  /**
   * Auth user with login name and password
   * @param  {String} login    login name
   * @param  {String} password login password
   * @return {User}
  */
  async auth(userName: string, password: string) {
    const user = await User.auth(userName, password);
    if (!user) {
      return null;
    }
    return convertToUser(user);
  }

  /**
   * Get user by login name
   * @param  {String} login  login name
   * @return {User}
  */
  async get(userName:string) {
    const user = await User.findByName(userName);
    if (!user) {
      return null;
    }
    return convertToUser(user);
  }
}