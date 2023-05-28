import { AppConfig } from "../interface";
import path = require("path");
import Nfs = require("fs-cnpm");
const version = require("../../package.json").version;
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
  // sync package.json/dist-tag.json to sync dir
  syncBackupFiles: false,

  // package tarball store in local filesystem by default
  nfs: new Nfs({
    dir: path.join(dataDir, 'nfs')
  }),

  // /-/all/changes
  // since different changes are aggregated through many tables
  // prevent changesStream changes collisions
  changesDelay: 5000,
  // always-auth https://docs.npmjs.com/misc/config#always-auth
  // Force npm to always require authentication when accessing the registry, even for GET requests.
  alwaysAuth: false,

  // enable private mode or not
  // private mode: only admins can publish, other users just can sync package from source npm
  // public mode: all users can publish
  enablePrivate: false,

  // max handle number of package.json `dependencies` property
  maxDependencies: 200,

  // if install return 404, try to sync from source registry
  syncByInstall: true,

  // https://github.com/cnpm/cnpmjs.org/issues/1149
  // if enable this option, must create module_abbreviated and package_readme table in database
  enableAbbreviatedMetadata: true,

  // enable bug version hotfix by https://github.com/cnpm/bug-versions
  enableBugVersion: true,
  // registry http response cache control header
  // if you are using CDN, can set it to 'max-age=0, s-maxage=10, must-revalidate'
  // it meaning cache 10s on CDN server and no cache on client side.
  registryCacheControlHeader: '',
  // if you are using CDN, can set it to 'Accept, Accept-Encoding'
  registryVaryHeader: '',

  /**
 * sync configs
 */

  // the official npm registry
  // cnpm wont directly sync from this one
  // but sometimes will request it for some package infomations
  // please don't change it if not necessary
  officialNpmRegistry: 'https://registry.npmjs.com',
  officialNpmReplicate: 'https://replicate.npmjs.com',
  cnpmRegistry: 'https://r.cnpmjs.com',

  // sync devDependencies or not, default is false
  syncDevDependencies: false,
  // try to remove all deleted versions from original registry
  syncDeletedVersions: true,

  // sync source, upstream registry
  // If you want to directly sync from official npm's registry
  // please drop them an email first
  sourceNpmRegistry: 'https://registry.npmmirror.com',
  sourceNpmWeb: 'https://npmmirror.com',

  // set remote registry to show web page data
  enableWebDataRemoteRegistry: false,
  webDataRemoteRegistry: '',

  // if you're behind firewall, need to request through http proxy, please set this
  // e.g.: `httpProxy: 'http://proxy.mycompany.com:8080'`
  httpProxy: null,

  // registry download accelerate map
  accelerateHostMap: {},

  version,

  // upstream registry is base on cnpm/cnpmjs.org or not
  // if your upstream is official npm registry, please turn it off
  sourceNpmRegistryIsCNpm: true,

  syncConcurrency: 1,
  // sync interval, default is 10 minutes
  syncInterval: '10m',

  // changes streaming sync
  syncChangesStream: false,
  syncDownloadOptions: {
    // formatRedirectUrl: function (url, location)

  },

  // When sync package, cnpm not know the access protocol.
  // So should set manually
  backupProtocol: 'http',

  // custom format full package list
  // change `GET /:name` request response body
  // use on `controllers/registry/list.js`
  formatCustomFullPackageInfoAndVersions: (packageInfo) => {
    return packageInfo;
  },

  // custom format one package version
  // change `GET /:name/:version` request response body
  // use on `controllers/registry/show.js`
  formatCustomOnePackageVersion: (packageVersion) => {
    return packageVersion;
  },

} as AppConfig;
