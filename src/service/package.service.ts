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
import ModuleDependency = require("../models/module_deps");
import ModuleKeyword = require("../models/module_keyword");
import ModuleStar = require("../models/module.star");
import User = require("../models/user");
import semver = require("semver");
import { setDownloadURL } from "../lib";
import PackageReadme = require("../models/package_readme");


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

function stringifyPackage(pkg) {
  return encodeURIComponent(JSON.stringify(pkg));
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
    const latestMod = await this.getLatestModule(packageName);
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

  async updateModulePackage(id, pkg) {
    var mod = await Module.findById(Number(id));
    if (!mod) {
      // not exists
      return null;
    }
    mod.package = stringifyPackage(pkg);
    return await mod.save();
  }

  async updateModuleLastModified(name: string) {
    const row = await Module.model.findOne({
      where: { name: name },
      order: [['gmt_modified', 'DESC']],
    });
    if (!row) {
      return null;
    }
    // gmt_modified is readonly, we must use setDataValue
    row.setDataValue('gmt_modified', new Date());
    return await row.save();
  }

  async addDependency(name: string, dependency: string) {
    const row = await ModuleDependency.model.findOne({
      where: {
        name: name,
        deps: dependency
      }
    });
    if (row) {
      return row;
    }
    return await ModuleDependency.model.build({
      name: name,
      deps: dependency
    }).save();
  }


  async addDependencies(name: string, dependencies: Array<string>) {
    const tasks = [];
    for (var i = 0; i < dependencies.length; i++) {
      tasks.push(await this.addDependency(name, dependencies[i]));
    }
    return tasks;
  }

  async saveModule(mod) {
    let keywords = mod.package.keywords;
    if (typeof keywords === 'string') {
      keywords = [keywords];
    }
    const pkg = stringifyPackage(mod.package);
    const description = mod.package && mod.package.description || '';
    const dist = mod.package.dist || {};

    const publish_time = mod.publish_time || Date.now();
    var item = await Module.findByNameAndVersion(mod.name, mod.version);
    if (!item) {
      item = Module.model.build({
        name: mod.name,
        version: mod.version
      });
    }
    item.publishTime = publish_time;
    // meaning first maintainer, more maintainers please check module_maintainer table
    item.author = mod.author;
    item.package = pkg;
    item.distTarball = dist.tarball;
    item.distShasum = dist.shasum;
    item.distSize = dist.size;
    item.description = description;

    if (item.changed()) {
      item = await item.save();
    }
    const result = {
      id: item.id,
      gmt_modified: item.gmtModified
    };


    const words = [];
    for (let i = 0; i < keywords.length; i++) {
      let w = keywords[i];
      if (typeof w === 'string') {
        w = w.trim();
        if (w) {
          words.push(w);
        }
      }
    }

    if (words.length > 0) {
      // add keywords
      await this.addKeywords(mod.name, description, words);
    }

    return result;
  }

  async addKeyword(data) {
    var item = await ModuleKeyword.findByKeywordAndName(data.keyword, data.name);
    if (!item) {
      item = ModuleKeyword.model.build(data);
    }
    // item.description = data.description;
    if (item.changed()) {
      // make sure object will change, otherwise will cause empty sql error
      // @see https://github.com/cnpm/cnpmjs.org/issues/533
      return console.log("await item.save()", await item.save());
    }
    console.log()
    return item;
  }

  async addKeywords(name: string, description: string, keywords: Array<string>) {
    const tasks = [];
    for (let index = 0; index < keywords.length; index++) {
      tasks.push(await this.addKeyword({
        name: name,
        keyword: keywords[index],
        description: description
      }));
    }

    return tasks;
  }
  async addModuleTag(name: string, tag: string, version: string) {
    const mod = await this.getModule(name, version);
    if (!mod) {
      return null;
    }

    let row = await Tag.findByNameAndTag(name, tag);
    if (!row) {
      row = Tag.model.build({
        name: name,
        tag: tag
      });
    }
    row.moduleId = mod.id;
    row.version = version;
    if (row.changed()) {
      return await row.save();
    }
    return row;
  }

  // only can add to cnpm maintainer table
  async addPrivateModuleMaintainers(name: string, usernames: Array<string>) {
    return await PrivateModuleMaintainer.addMaintainers(name, usernames);
  }

  async getModuleLastModified(name: string) {
    const gmt_modified: string = await Module.model.max('gmtModified', {
      where: {
        name: name,
      },
    });
    return gmt_modified;
  }

  async listModuleTags(name) {
    return await Tag.findAll({ where: { name: name } });
  }

  async listModuleAbbreviatedsByName(name: string) {
    if (!appConfig.enableAbbreviatedMetadata) {
      return [];
    }

    var rows = await ModuleAbbreviated.findAll({
      where: {
        name: name,
      },
      order: [['id', 'DESC']],
    });

    for (var row of rows) {
      row.package = JSON.parse(row.package);
      if (row.publishTime && typeof row.publishTime === 'string') {
        // pg bigint is string
        row.publishTime = Number(row.publishTime);
      }
    }
    return rows;
  }
  async listModulesByName(moduleName: string, attributes?: Array<string>) {
    var mods = await Module.model.findAll({
      where: {
        name: moduleName
      },
      order: [['id', 'DESC']],
      attributes
    });

    for (var mod of mods) {
      parseRow(mod);
    }
    return mods;
  }
  async listStarUserNames(moduleName: string) {
    var rows = await ModuleStar.model.findAll({
      where: {
        name: moduleName
      }
    });
    return rows.map(function (row) {
      return row.user;
    });
  }
  async listMaintainers(name: string) {
    var mod = await getMaintainerModel(name);
    var usernames = await mod.listMaintainers(name);
    if (usernames.length === 0) {
      return usernames;
    }
    var users = await User.listByNames(usernames);
    return users.map(function (user) {
      return {
        name: user.name,
        email: user.email
      };
    });
  }
  async getUnpublishedModule(name: string) {
    return await ModuleUnpublished.findByName(name);
  }

  async saveUnpublishedModule(name: string, pkg) {
    return await ModuleUnpublished.save(name, pkg);
  };

  async removeModulesByName(name: string) {
    await Module.model.destroy({
      where: {
        name: name,
      },
    });
    if (appConfig.enableAbbreviatedMetadata) {
      await ModuleAbbreviated.model.destroy({
        where: {
          name: name,
        },
      });
    }
  }
  async removeModuleTags(name: string) {
    return await Tag.model.destroy({ where: { name: name } });
  }

  async listPublicModuleMaintainers(name: string) {
    return await NpmModuleMaintainer.listMaintainers(name);
  }

  // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object
  async saveModuleAbbreviated(mod, remoteAbbreviatedVersion) {
    // try to use remoteAbbreviatedVersion first
    var pkg;
    if (remoteAbbreviatedVersion) {
      pkg = Object.assign({}, remoteAbbreviatedVersion, {
        // override remote tarball
        dist: Object.assign({}, remoteAbbreviatedVersion.dist, mod.package.dist, {
          noattachment: undefined,
        }),
      });
    } else {
      pkg = Object.assign({}, mod.package, {
        // ignore readme force
        readme: undefined,
      });
    }
    var publish_time = mod.publish_time || Date.now();
    var item = await ModuleAbbreviated.findByNameAndVersion(mod.name, mod.version);
    if (!item) {
      item = ModuleAbbreviated.model.build({
        name: mod.name,
        version: mod.version,
      });
    }
    item.publishTime = publish_time;
    item.package = JSON.stringify(pkg);

    if (item.changed()) {
      item = await item.save();
    }
    var result = {
      id: item.id,
      gmt_modified: item.gmtModified,
    };

    return result;
  };

  async getModuleById(id: number) {
    var row = await Module.findById(Number(id));
    parseRow(row);
    return row;
  }

  async getModuleByRange(name: string, range) {
    var rows = await this.listModulesByName(name, ['id', 'version']);
    var versionMap = {};
    var versions = rows.map(function (row) {
      versionMap[row.version] = row;
      return row.version;
    }).filter(function (version) {
      return semver.valid(version);
    });

    var version = semver.maxSatisfying(versions, range);
    if (!versionMap[version]) {
      return null;
    }

    var id = versionMap[version].id;
    return await this.getModuleById(id);
  }
  async showPackage(name: string, tag: string, ctx) {
    if (tag === '*') {
      tag = 'latest';
    }
    if (tag === '*') {
      tag = 'latest';
    }
    var version = semver.valid(tag);
    var range = semver.validRange(tag);
    var mod;
    if (version) {
      mod = await this.getModule(name, version);
    } else if (range) {
      mod = await this.getModuleByRange(name, range);
    } else {
      mod = await this.getModuleByTag(name, tag);
    }

    if (mod) {
      setDownloadURL(mod.package, ctx || {});
      mod.package._cnpm_publish_time = mod.publish_time;
      mod.package.publish_time = mod.package.publish_time || mod.publish_time;
      var rs = [
        await this.listMaintainers(name),
        await this.listModuleTags(name),
      ];
      var maintainers = rs[0];
      if (maintainers.length > 0) {
        mod.package.maintainers = maintainers;
      }
      var tags = rs[1];
      var distTags = {};
      for (var i = 0; i < tags.length; i++) {
        var t = tags[i];
        // @ts-ignore
        distTags[t.tag] = t.version;
      }
      // show tags for npminstall faster download
      mod.package['dist-tags'] = distTags;
      return mod;
    }
  }

  async removeModulesByNameAndVersions(name: string, versions) {
    await Module.model.destroy({
      where: {
        name: name,
        version: versions,
      }
    });
    if (appConfig.enableAbbreviatedMetadata) {
      await ModuleAbbreviated.model.destroy({
        where: {
          name: name,
          version: versions,
        },
      });
    }
  }

  async updateModuleDescription(id, description) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    mod.description = description;
    // also need to update package.description
    var pkg = mod.package || {};
    // @ts-ignore
    pkg.description = description;
    mod.package = stringifyPackage(pkg);

    return await mod.save({
      fields: ['description', 'package']
    });
  }

  async removeModuleTagsByNames(moduleName: string, tagNames) {
    return await Tag.model.destroy({
      where: {
        name: moduleName,
        tag: tagNames
      }
    });
  }
  async updateModuleReadme(id, readme) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    var pkg = mod.package || {};
    // @ts-ignore
    pkg.readme = readme;
    return await this.updateModulePackage(id, pkg);
  }

  async updateModuleAbbreviatedPackage(item) {
    // item => { id, name, version, _hasShrinkwrap, os, cpu, peerDependenciesMeta, workspaces }
    var mod = await ModuleAbbreviated.findByNameAndVersion(item.name, item.version);
    if (!mod) {
      return null;
    }
    var pkg = JSON.parse(mod.package);
    for (var key in item) {
      if (key === 'name' || key === 'version' || key === 'id') {
        continue;
      }
      pkg[key] = item[key];
    }
    mod.package = JSON.stringify(pkg);

    return await mod.save({
      fields: ['package']
    });
  }

  async updateModulePackageFields(id, fields) {
    var mod = await this.getModuleById(id);
    if (!mod) {
      return null;
    }
    var pkg = mod.package || {};
    for (var k in fields) {
      pkg[k] = fields[k];
    }
    return await this.updateModulePackage(id, pkg);
  }

  async addStar(name: string, user: string) {
    var row = await ModuleStar.model.findOne({
      where: {
        name: name,
        user: user
      }
    });
    if (row) {
      return row;
    }

    row = ModuleStar.model.build({
      name: name,
      user: user
    });
    return await row.save();
  }
  async addPublicModuleMaintainer(name: string, user: string) {
    return await NpmModuleMaintainer.addMaintainer(name, user);
  }

  async removePublicModuleMaintainer(name: string, user: string) {
    return await NpmModuleMaintainer.removeMaintainers(name, user);
  }

  // try to return latest version readme
  async getPackageReadme(name: string, onlyPackageReadme?) {
    if (appConfig.enableAbbreviatedMetadata) {
      var row = await PackageReadme.findByName(name);
      if (row) {
        return {
          version: row.version,
          readme: row.readme,
        };
      }
      if (onlyPackageReadme) {
        return;
      }
    }
  }

  async savePackageReadme (name:string, readme, latestVersion) {
    var item = await PackageReadme.model.findOne({ where: { name: name } });
    if (!item) {
      item = PackageReadme.model.build({
        name: name,
      });
    }
    item.readme = readme;
    item.version = latestVersion;
    return await item.save();
  }
}