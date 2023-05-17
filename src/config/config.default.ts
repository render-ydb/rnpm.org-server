import { MidwayConfig } from "@midwayjs/core";
import appConfig = require("../appConfig");

const midwayConfig: MidwayConfig = {
  // use for cookie sign key, should change to your own and keep security
  keys: '1683448357044_7620',
  koa: {
    port: 7001,
  },
  swagger: {
    title: '接口服务文档',
    tagSortable: true,
    description: 'rnpm中registry和web两个部分用到的接口服务文档',
    swaggerPath: 'api-docs',
    tags: [
      {
        name: 'registry',
        description: 'npm registry中用到的接口API'
      },
      {
        name: 'web',
        description: 'npm配套UI中的页面使用的接口'
      },
    ]
  },
  sequelize: {
    dataSource: {
      default: {
        database: appConfig.database,
        username: 'root',
        password: "123456",
        port: 3306,
        dialect: 'mysql',
        entities: [
          "entity"
        ],
        define: {
          timestamps: true,
          createdAt: 'gmtCreate',
          updatedAt: 'gmtModified',
          charset: 'utf8',
          collate: 'utf8_general_ci',
        },
        sync: true,
      }
    }
  }
}

if (appConfig.redisCache) {
  midwayConfig.redis = {
    client: {
      port: 6379, 
      host: "127.0.0.1", 
      password: "auth",
      db: 0,
    },
  }

}


export default midwayConfig;