import { IProjectConfig } from "../interface";


export default {
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
        database: "render",
        username: 'root',
        password: "123456",
        port: '3306',
        dialect: 'mysql',
        entities:[
          "entity"
        ],
        define: {
          timestamps: true,
          createdAt: 'gmt_create',
          updatedAt: 'gmt_modified',
          charset: 'utf8',
          collate: 'utf8_general_ci',
        },
        sync: true,
      }
    }
  }


} as IProjectConfig;
