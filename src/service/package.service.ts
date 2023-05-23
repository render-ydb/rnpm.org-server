import { Inject, Provide } from "@midwayjs/core";
import { Context } from '@midwayjs/koa';
import { QueryTypes, Sequelize, Op } from "sequelize";
import { TagEntity } from "../entity/tag.entity";
import { isPrivatePackage } from "../utils";
import appConfig = require("../appConfig");
import { UtilService } from "./util.service";
import { Json } from "../interface";
import Module = require("../models/module");
import { CHANGE_TYPE } from "../utils";
import Tag = require("../models/tag");
import ModuleUnpublished = require("../models/module_unpublished");
import ModuleAbbreviated = require("../models/module_abbreviated");
import PrivateModuleMaintainer = require("../models/module_maintainer");
import NpmModuleMaintainer = require("../models/npm_module_maintaine");
import { ModuleEntity } from "../entity/module.entity";

const getMaintainerModel = async (name: string) => {
  return isPrivatePackage(name) ? PrivateModuleMaintainer : NpmModuleMaintainer;
}
const _parseRow = (row: ModuleEntity) => {
  if (row.package.indexOf('%7B%22') === 0) {
    // now store package will encodeURIComponent() after JSON.stringify
    row.package = decodeURIComponent(row.package);
  }
  row.package = JSON.parse(row.package);
  if (typeof row.publishTime === 'string') {
    // pg bigint is string
    row.publishTime = Number(row.publishTime);
  }
};

const parseRow = (row: ModuleEntity) => {
  if (row && row.package) {
    try {
      _parseRow(row);
    } catch (e) {
      console.warn('parse package error: %s, id: %s version: %s, error: %s', row.name, row.id, row.version, e);
    }
  }
}
@Provide()
export class PackageService {
  @Inject()
  ctx: Context;

  @Inject()
  utilService: UtilService

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

  listModelSince(Model, attributes, mapper) {
    return async (since, limit) => {
      const start = this.utilService.ensureSinceIsDate(since);
      const findCondition: Json = {
        attributes: attributes,
        where: {
          gmt_modified: {
            gte: start,
            // 添加延时，防止同一时间多个数据未同步
            lte: new Date(Date.now() - appConfig.changesDelay || 5000),
          },
        },
        order: [
          ["gmt_modified", "ASC"],
          ["id", "ASC"],
        ],
      };
      if (limit) {
        findCondition.limit = limit;
      }
      const rows = await Model.findAll(findCondition);
      return rows.map(mapper);
    }
  }

  async listVersionSince(since, limit) {
    const func = this.listModelSince(
      Module,
      ['id', 'name', 'version', 'gmtModified'],
      function (row) {
        return {
          type: CHANGE_TYPE.PACKAGE_VERSION_ADDED,
          id: row.name,
          changes: [{ version: row.version }],
          gmt_modified: row.gmtModified,
        };
      }
    );
    return await func(since, limit)
  }

  async listTagSince(since, limit) {
    const func = this.listModelSince(
      Tag,
      ['id', 'name', 'tag', 'gmtModified'],
      function (row) {
        return {
          type: CHANGE_TYPE.PACKAGE_TAG_ADDED,
          id: row.name,
          changes: [{ tag: row.tag }],
          gmt_modified: row.gmtModified,
        };
      }
    );
    return await func(since, limit)
  }

  async listUnpublishedModuleSince(since, limit) {
    const func = this.listModelSince(
      ModuleUnpublished,
      ['id', 'name', 'gmtModified'],
      function (row) {
        return {
          type: CHANGE_TYPE.PACKAGE_UNPUBLISHED,
          id: row.name,
          gmt_modified: row.gmtModified,
        };
      }
    );
    return await func(since, limit)
  }

  async listPublicModuleNamesSince(start) {
    if (!(start instanceof Date)) {
      start = new Date(Number(start));
    }
    const rows = await Tag.findAll({
      attributes: ['name'],
      where: {
        gmt_modified: {
          gt: start
        }
      },
    });
    const names = {};
    for (let i = 0; i < rows.length; i++) {
      names[rows[i].name] = 1;
    }
    return Object.keys(names);
  };

  // module:list
  async listPrivateModulesByScope(scope: string) {
    var tags = await Tag.findAll({
      where: {
        tag: 'latest',
        name: {
          [Op.like]: scope + '/%'
        }
      }
    });

    if (tags.length === 0) {
      return [];
    }

    const ids = tags.map(function (tag) {
      return tag.moduleId;
    });

    return await Module.findAll({
      where: {
        id: ids
      }
    });
  };

  async listModules(names: Array<string>) {
    if (names.length === 0) {
      return [];
    }

    // fetch latest module tags
    const tags = await Tag.findAll({
      where: {
        name: names,
        tag: 'latest'
      }
    });
    if (tags.length === 0) {
      return [];
    }

    const ids = tags.map(function (tag) {
      return tag.moduleId;
    });

    var rows = await Module.findAll({
      where: {
        id: ids
      },
      attributes: [
        'name', 'description', 'version',
      ]
    });
    return rows;
  };

  async findAllModuleAbbreviateds(where, order?, limit?, offset?) {
    const params = {
      where,
      order,
      limit,
      offset,
      attributes: ['name', 'version', 'publish_time', 'gmt_modified'],
    };
    const rows = await ModuleAbbreviated.findAll(params);
    return rows;
  };

  async authMaintainer(packageName: string, username: string) {
    const mod = await getMaintainerModel(packageName);

    let maintainers = await mod.listMaintainers(packageName);
    const latestMod =  await this.getLatestModule(packageName);
    if (maintainers.length === 0) {
      // if not found maintainers, try to get from latest module package info
      // @ts-ignore
      const ms = latestMod && latestMod.package && latestMod.package.maintainers;
      if (ms && ms.length > 0) {
        maintainers = ms.map(function (user) {
          return user.name;
        });
      }
    }

    let isMaintainer = false;
    // @ts-ignore
    if (latestMod && !latestMod.package._publish_on_cnpm) {
      // no one can update public package maintainers
      // public package only sync from source npm registry
      isMaintainer = false;
    } else if (maintainers.length === 0) {
      // no maintainers, meaning this module is free for everyone
      isMaintainer = true;
    } else if (maintainers.indexOf(username) >= 0) {
      isMaintainer = true;
    }

    return {
      isMaintainer: isMaintainer,
      maintainers: maintainers
    };
  };

  async getLatestModule(name: string) {
    return await this.getModuleByTag(name, 'latest');
  };
  async getModuleByTag(name, tag) {
    const row = await Tag.findByNameAndTag(name, tag);
    if (!row) {
      return null;
    }
    return await this.getModule(row.name, row.version);
  };

  async getModule(name: string, version: string) {
    const row = await Module.findByNameAndVersion(name, version);
    parseRow(row);
    return row;
  }
}