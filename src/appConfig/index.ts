import { AppConfig } from "../interface";
import path = require("path");
// =>src
const root = path.dirname(__dirname);
const dataDir = path.join(process.env.HOME || root, '.rnpm.org');

export = {
    // update file template dir
  uploadDir: path.join(dataDir, 'downloads'),

  // registry url name
  registryHost: 'r.rnpmjs.org',
  // default is ctx.protocol
  protocol: '',
  // default system admins
  admins: {
    // name: email
    fengmk2: 'fengmk2@gmail.com',
    admin: 'admin@cnpmjs.org',
    dead_horse: 'dead_horse@qq.com',
  },
  // some registry already have some private packages in global scope
  // but we want to treat them as scoped private packages,
  // so you can use this white list.
  privatePackages: [],
  // registry scopes, if don't set, means do not support scopes
  scopes: ['@cnpm', '@cnpmtest', '@cnpm-test'],
  // when you not intend to ingegrate with your company's user system, then use null, it would
  // use the default cnpm user system
  userService: null,
  customUserService:false

} as AppConfig;