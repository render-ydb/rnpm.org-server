import { SwaggerOptions } from "@midwayjs/swagger";
/**
 * @description configuration file types
*/

interface IAdmins {
  fengmk2: string;
  admin: string;
  dead_horse: string
}

export interface AppConfig {
  swagger: SwaggerOptions;
  uploadDir: string
  registryHost: string,
  protocol: string,
  admins: IAdmins,
  privatePackages: Array<string>,
  scopes: Array<string>,
  userService:any,
  customUserService:boolean
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
  date: string
}


export type Json = Record<string,any>
