/**
 * @description configuration file types
*/


interface MailAuth {
  user: string;
  pass: string;
}

interface Mail {
  enable: boolean;
  appname: string;
  from: string;
  service: string;
  auth: MailAuth
}


export interface AppConfig {
  uploadDir: string;
  registryHost: string;
  protocol: string;
  admins: Record<string, any>;
  privatePackages: Array<string>;
  scopes: Array<string>;
  redisCache: boolean;
  mail: Mail;
  logdir: string;
  debug: boolean;
  database: string;
  syncModel: 'none' | 'all' | 'exist';
  nfs: any

}


/**
 * @description 需要创建用户的用户信息
 */
export interface UserBaseInfo {
  _id: string;
  name: string;
  password: string;
  email: string;
  type: string;
  roles: Array<string>;
  date: string,
  salt: string,
  password_sha: string,
  readonly: any
  cidr_whitelist: Array<string>
}


export type Json = Record<string, any>
