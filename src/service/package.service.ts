import { Inject, Provide } from "@midwayjs/core";
import { Context } from '@midwayjs/koa';
import { QueryTypes, Sequelize } from "sequelize";
import { TagEntity } from "../entity/tag.entity";
import { isPrivatePackage } from "../utils";

@Provide()
export class PackageService {
  @Inject()
  ctx: Context;

  async listAllPublicModuleNames() {
    const globalSequlize: Sequelize = this.ctx.app.getAttr("globalSequlize");
    const sql = 'SELECT DISTINCT(name) AS name FROM tag ORDER BY name';
    const rows = await globalSequlize.query<TagEntity>(sql, { type: QueryTypes.SELECT });
    return rows.filter(function (row) {
      return !isPrivatePackage(row.name);
    }).map(function (row) {
      return row.name;
    });
  };
}