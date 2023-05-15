import { Configuration, App, IMidwayContainer } from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
import * as validate from '@midwayjs/validate';
import * as swagger from '@midwayjs/swagger';
import * as info from '@midwayjs/info';
import { join } from 'path';
import { DefaultErrorFilter } from './filter/default.filter';
import { NotFoundFilter } from './filter/notfound.filter';
import { ValidateErrorFilter } from './filter/validate.filter';
import { ReportMiddleware } from './middleware/report.middleware';
import * as sequelize from '@midwayjs/sequelize';
import * as redis from '@midwayjs/redis';

@Configuration({
  imports: [
    koa,
    validate,
    sequelize,
    swagger,
    {
      component: info,
      enabledEnvironment: ['local'],
    },
    redis
  ],
  importConfigs: [join(__dirname, './config')],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady(container: IMidwayContainer) {
    const dataSourceManager = await container.getAsync(sequelize.SequelizeDataSourceManager);
    const globalSequlize = dataSourceManager.getDataSource('default');
    this.app.setAttr('globalSequlize', globalSequlize);
    // add middleware
    this.app.useMiddleware([ReportMiddleware]);
    // add filter
    this.app.useFilter([NotFoundFilter, DefaultErrorFilter, ValidateErrorFilter]);
  }
}
