import { AppConfig } from "../interface";
import path = require("path");
import Nfs = require("fs-cnpm");
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
    render: '1609059419@qq.com',
    // admin: 'admin@cnpmjs.org',
    // dead_horse: 'dead_horse@qq.com',
  },
  // some registry already have some private packages in global scope
  // but we want to treat them as scoped private packages,
  // so you can use this white list.
  privatePackages: [],
  // registry scopes, if don't set, means do not support scopes
  scopes: ['@cnpm', '@cnpmtest', '@cnpm-test'],
  redisCache: false,
  mail: {
    enable: false,
    appname: 'rnpmjs.org',
    from: 'rnpmjs.org mail sender <adderss@gmail.com>',
    service: 'gmail',
    auth: {
      user: 'address@gmail.com',
      pass: 'your password'
    }
  },
  // log dir name
  logdir: path.join(path.dirname(root), 'rnpm-logs'),
  // debug mode
  // if in debug mode, some middleware like limit wont load
  // logger module will print to stdout
  debug: process.env.NODE_ENV === 'development',
  database: "render",
  // sync mode select
  // none: do not sync any module, proxy all public modules from sourceNpmRegistry
  // exist: only sync exist modules
  // all: sync all modules
  syncModel: 'none', // 'none', 'all', 'exist'

  // package tarball store in local filesystem by default
  nfs: new Nfs({
    dir: path.join(dataDir, 'nfs')
  }),

} as AppConfig;
