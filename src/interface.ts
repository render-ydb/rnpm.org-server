import { MidwayConfig } from '@midwayjs/core';
import { SwaggerOptions } from "@midwayjs/swagger";
/**
 * @description configuration file types
*/
export interface IProjectConfig extends MidwayConfig {
  swagger: SwaggerOptions;
}


/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

/**
 * @description npm i/npm publish通过put请求上传包时候的body类型定义
 */
export interface IUserOptions {
  uid: number;
}

/**
 * @description 需要创建用户的用户信息
 */
export interface IUserBaseInfo {
  _id: string;
  name:string;
  password:string;
  email:string;
  type:string;
  roles:Array<string>;
  date:string
}

