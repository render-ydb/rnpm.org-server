/**
 * @description configuration file types
*/
import { Context } from '@midwayjs/koa';

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
  changesDelay: number;
  alwaysAuth: boolean;
  enablePrivate: boolean;
  maxDependencies: number;
  syncByInstall: boolean;
  enableAbbreviatedMetadata: boolean;
  enableBugVersion: boolean;
  registryCacheControlHeader: string;
  registryVaryHeader: string;
  officialNpmRegistry: string;
  officialNpmReplicate: string;
  cnpmRegistry: string;
  syncDevDependencies: boolean;
  sourceNpmRegistry: string;
  sourceNpmWeb: string;
  enableWebDataRemoteRegistry: boolean;
  webDataRemoteRegistry: string;
  httpProxy: string;
  accelerateHostMap:Json;
  version:string;
  sourceNpmRegistryIsCNpm:boolean;
  syncDeletedVersions:boolean;
  syncBackupFiles:boolean;
  syncConcurrency:number;
  syncInterval:string;
  syncChangesStream:boolean;
  syncDownloadOptions:Json
  backupProtocol:string;
  formatCustomFullPackageInfoAndVersions:Function;
  formatCustomOnePackageVersion:Function
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


export type Json = Record<string, any>;

// 增强的上下文

export interface AppUser {
  error: Error;
  name: string;
  isAdmin: boolean;
  scopes: Array<string>;
  email?: string
}
export interface AppContext extends Context {
  user: AppUser;
  allowSync: boolean;
}

