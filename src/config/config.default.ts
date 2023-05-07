// import { MidwayConfig } from '@midwayjs/core';
import { SwaggerOptions } from "@midwayjs/swagger";
// use for cookie sign key, should change to your own and keep security
export const keys = '1683448357044_7620';

export const koa = {
  port: 7001,
};
// export default {




// } as MidwayConfig;

export const swagger:SwaggerOptions = {
  title: '接口服务文档',
  tagSortable: true,
  description: 'rnpm中registry和web两个部分用到的接口服务文档',
  swaggerPath:'api-docs',
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
}
