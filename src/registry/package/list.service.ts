import { Inject, Provide } from "@midwayjs/core";
import { Context } from "@midwayjs/koa";
import * as common from "../../lib";
import config = require("../../appConfig");
import { PackageService } from "../../service/package.service";
import { BlockListService } from "../../service/blocklist.service";
import { BugVersionService } from "../../service/bug_version.service";
import utility = require("utility");
import SyncModuleWorker = require("../../utils/sync_module.woker");

function filterBlockVerions(rows, blocks) {
    if (!blocks) {
        return rows;
    }
    return rows.filter(row => !blocks[row.version]);
}

function etag(objs) {
    return 'W/"' + utility.md5(JSON.stringify(objs)) + '"';
}


@Provide()
export class ListService {

    @Inject()
    ctx: Context;

    @Inject()
    packageService: PackageService;

    @Inject()
    blockListService: BlockListService;

    @Inject()
    bugVersionService: BugVersionService;

    async listAllVersions() {
        const name = this.ctx.params[0] || this.ctx.params.name;
        const isSyncWorkerRequest = common.isSyncWorkerRequest(this.ctx);
        const isJSONPRequest = this.ctx.query.callback;

        let cacheKey = '';
        let needAbbreviatedMeta = false;
        let abbreviatedMetaType = 'application/vnd.npm.install-v1+json';

        if (config.enableAbbreviatedMetadata && this.ctx.accepts(['json', abbreviatedMetaType]) === abbreviatedMetaType) {
            needAbbreviatedMeta = true;
            console.log(needAbbreviatedMeta);
            console.log(isSyncWorkerRequest, isJSONPRequest);
            // don't cache result on sync request
            // if (cache && !isJSONPRequest && !isSyncWorkerRequest) {
            //   cacheKey = `list-${name}-v1`;
            // }
        }

        if (cacheKey) {
            // 加上redis缓存 todo
        }

        let modifiedTime = await this.packageService.getModuleLastModified(name);
        const tags = await this.packageService.listModuleTags(name);
        const blocks = await this.blockListService.findBlockPackageVersions(name);
        if (blocks && blocks['*']) {
            this.ctx.status = 451;
            const error = `[block] package was blocked, reason: ${blocks['*'].reason}`;
            this.ctx.jsonp = {
                name,
                error,
                reason: error,
            };
            return;
        }

        if (modifiedTime) {
            // find out the latest modfied time
            // because update tags only modfied tag, wont change module gmt_modified
            for (var i = 0; i < tags.length; i++) {
                var tag = tags[i];
                if (tag.gmtModified > modifiedTime) {
                    modifiedTime = tag.gmtModified;
                }
            }

            // must set status first
            this.ctx.status = 200;
            if (this.ctx.fresh) {
                this.ctx.status = 304;
                return;
            }
        }

        if (needAbbreviatedMeta) {
            let rows = await this.packageService.listModuleAbbreviatedsByName(name);
            rows = filterBlockVerions(rows, blocks);
            if (rows.length > 0) {
                await this, (this.ctx, name, modifiedTime, tags, rows, cacheKey, isSyncWorkerRequest);
                return;
            }
            var fullRows = await this.packageService.listModulesByName(name);
            fullRows = filterBlockVerions(fullRows, blocks);
            if (fullRows.length > 0) {
                // no abbreviated meta rows, use the full meta convert to abbreviated meta
                await this.handleAbbreviatedMetaRequestWithFullMeta(this.ctx, name, modifiedTime, tags, fullRows, isSyncWorkerRequest);
                return;
            }
        }

        const rows = await this.packageService.listModulesByName(name);
        var starUsers: any = await this.packageService.listStarUserNames(name);
        const maintainers = await this.packageService.listMaintainers(name);

        // todo
        var starUserMap = {};
        for (var i = 0; i < starUsers.length; i++) {
            var starUser = starUsers[i];
            if (starUser[0] !== '"' && starUser[0] !== "'") {
                starUserMap[starUser] = true;
            }
        }
        starUsers = starUserMap;

        if (rows.length === 0) {
            // check if unpublished
            var unpublishedInfo = await this.packageService.getUnpublishedModule(name);
            if (unpublishedInfo) {
                this.ctx.status = 404;
                this.ctx.jsonp = {
                    _id: name,
                    name: name,
                    time: {
                        // @ts-ignore
                        modified: unpublishedInfo.package.time,
                        unpublished: unpublishedInfo.package,
                    },
                    _attachments: {},
                };
                return;
            }
        }

        // if module not exist in this registry,
        // sync the module backend and return package info from official registry
        if (rows.length === 0) {
            if (!this.ctx.allowSync) {
                this.ctx.status = 404;
                const error = '[not_found] document not found';
                this.ctx.jsonp = {
                    error,
                    reason: error,
                };
                return;
            }

            // start sync
            var logId = await SyncModuleWorker.sync(name, 'sync-by-install');
            console.log(logId)
            return this.ctx.redirect(config.officialNpmRegistry + this.ctx.url);
        }

        var latestMod = null;
        var readme = null;
        // set tags
        var distTags = {};
        for (var i = 0; i < tags.length; i++) {
            var t = tags[i];
            distTags[t.tag] = t.version;
        }

        // set versions and times
        var versions = {};
        var allVersionString = '';
        var times = {};
        var attachments = {};
        var createdTime = null;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            let pkg = row.package;
            // pkg is string ... ignore it
            if (typeof pkg === 'string') {
                continue;
            }
            common.setDownloadURL(pkg, this);
            // @ts-ignore
            pkg._cnpm_publish_time = row.publishTime;
            // @ts-ignore
            pkg.publish_time = pkg.publish_time || row.publishTime;
            // @ts-ignore
            versions[pkg.version] = pkg;
            // @ts-ignore
            allVersionString += pkg.version + ',';
            // @ts-ignore
            var t: any = times[pkg.version] = row.publishTime ? new Date(row.publishTime) : row.gmtModified;
            // @ts-ignore
            if ((!distTags['latest'] && !latestMod) || distTags['latest'] === pkg.version) {
                latestMod = row;
                // @ts-ignore
                readme = pkg.readme;
            }
            // @ts-ignore
            delete pkg.readme;
            if (maintainers.length > 0) {
                // @ts-ignore
                pkg.maintainers = maintainers;
            }

            if (!createdTime || t < createdTime) {
                createdTime = t;
            }
        }
        if (!isSyncWorkerRequest) {
            await this.bugVersionService.hotfix(rows);
        }

        if (modifiedTime && createdTime) {
            var ts = {
                modified: modifiedTime,
                created: createdTime,
            };
            for (let t in times) {
                ts[t] = times[t];
            }
            times = ts;
        }
        if (!latestMod) {
            latestMod = rows[0];
        }

        var rev = String(latestMod.id);
        let pkg = latestMod.package;

        if (tags.length === 0) {
            // some sync error reason, will cause tags missing
            // set latest tag at least
            distTags['latest'] = pkg.version;
        }
        if (!readme && config.enableAbbreviatedMetadata) {
            var packageReadme = await this.packageService.getPackageReadme(name);
            if (packageReadme) {
                readme = packageReadme.readme;
            }
        }
        var info: any = {
            _id: name,
            _rev: rev,
            name: name,
            description: pkg.description,
            'dist-tags': distTags,
            maintainers: pkg.maintainers,
            time: times,
            users: starUsers,
            author: pkg.author,
            repository: pkg.repository,
            versions: versions,
            readme: readme,
            _attachments: attachments,
        };
        info.readmeFilename = pkg.readmeFilename;
        info.homepage = pkg.homepage;
        info.bugs = pkg.bugs;
        info.license = pkg.license;


        if (typeof config.formatCustomFullPackageInfoAndVersions === 'function') {
            info = config.formatCustomFullPackageInfoAndVersions(info);
        }
        this.ctx.jsonp = info;
        this.ctx.etag = etag([
            modifiedTime,
            distTags,
            pkg.maintainers,
            allVersionString,
        ]);

        if (config.registryCacheControlHeader) {
            this.ctx.set('cache-control', config.registryCacheControlHeader);
        }
        if (config.registryVaryHeader) {
            this.ctx.set('vary', config.registryVaryHeader);
        }
        console.log(info)

        return info
        // return {
        //     rows,
        //     starUsers,
        //     maintainers
        // }
    }

    async handleAbbreviatedMetaRequest(ctx, name, modifiedTime, tags, rows, cacheKey, isSyncWorkerRequest) {
        const isJSONPRequest = ctx.query.callback;
        var latestMod = null;
        // set tags
        var distTags = {};
        for (var i = 0; i < tags.length; i++) {
            var t = tags[i];
            distTags[t.tag] = t.version;
        }

        // set versions and times
        var versions = {};
        var allVersionString = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var pkg = row.package;
            common.setDownloadURL(pkg, ctx);
            pkg._publish_on_cnpm = undefined;
            pkg.publish_time = pkg.publish_time || row.publish_time;

            versions[pkg.version] = pkg;
            allVersionString += pkg.version + ',';

            if ((!distTags['latest'] && !latestMod) || distTags['latest'] === pkg.version) {
                latestMod = row;
            }
            // abbreviatedMeta row maybe update by syncer on missing attributes add
            if (!modifiedTime || row.gmt_modified > modifiedTime) {
                modifiedTime = row.gmt_modified;
            }
        }
        // don't use bug-versions hotfix on sync request
        if (!isSyncWorkerRequest) {
            await this.bugVersionService.hotfix(rows);
        }

        if (!latestMod) {
            latestMod = rows[0];
        }

        if (tags.length === 0) {
            // some sync error reason, will cause tags missing
            // set latest tag at least
            distTags['latest'] = latestMod.package.version;
        }

        var info = {
            name: name,
            modified: modifiedTime,
            'dist-tags': distTags,
            versions: versions,
        };

        // use faster etag
        const resultEtag = etag([
            modifiedTime,
            distTags,
            allVersionString,
        ]);

        if (isJSONPRequest) {
            ctx.jsonp = info;
        } else {
            ctx.body = JSON.stringify(info);
            ctx.type = 'json';
            // set cache
            if (cacheKey) {
                // set cache async, dont block the response
                // cache.pipeline()
                //   .hmset(cacheKey, 'etag', resultEtag, 'body', ctx.body)
                //   // cache 120s
                //   .expire(cacheKey, 120)
                //   .exec()
                //   .catch(err => {
                //     logger.error(err);
                //   });
            }
        }
        ctx.etag = resultEtag;
        if (config.registryCacheControlHeader) {
            ctx.set('cache-control', config.registryCacheControlHeader);
        }
        if (config.registryVaryHeader) {
            ctx.set('vary', config.registryVaryHeader);
        }
    }

    async handleAbbreviatedMetaRequestWithFullMeta(ctx, name, modifiedTime, tags, rows, isSyncWorkerRequest) {

        var latestMod = null;
        // set tags
        var distTags = {};
        for (var i = 0; i < tags.length; i++) {
            var t = tags[i];
            distTags[t.tag] = t.version;
        }

        // set versions and times
        var versions = {};
        var allVersionString = '';
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            // pkg is string ... ignore it
            if (typeof row.package === 'string') {
                continue;
            }
            // https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md#abbreviated-version-object
            var hasInstallScript;
            if (row.package.scripts) {
                // https://www.npmjs.com/package/fix-has-install-script
                if (row.package.scripts.install || row.package.scripts.preinstall || row.package.scripts.postinstall) {
                    hasInstallScript = true;
                }
            }
            var pkg = {
                name: row.package.name,
                version: row.package.version,
                deprecated: row.package.deprecated,
                dependencies: row.package.dependencies,
                optionalDependencies: row.package.optionalDependencies,
                devDependencies: row.package.devDependencies,
                bundleDependencies: row.package.bundleDependencies,
                peerDependencies: row.package.peerDependencies,
                peerDependenciesMeta: row.package.peerDependenciesMeta,
                bin: row.package.bin,
                os: row.package.os,
                cpu: row.package.cpu,
                libc: row.package.libc,
                directories: row.package.directories,
                dist: row.package.dist,
                engines: row.package.engines,
                workspaces: row.package.workspaces,
                _hasShrinkwrap: row.package._hasShrinkwrap,
                hasInstallScript: hasInstallScript,
                publish_time: row.package.publish_time || row.publish_time,
            };
            common.setDownloadURL(pkg, ctx);

            versions[pkg.version] = pkg;
            row.package = pkg;
            allVersionString += pkg.version + ',';

            if ((!distTags['latest'] && !latestMod) || distTags['latest'] === pkg.version) {
                latestMod = row;
            }
        }
        if (!isSyncWorkerRequest) {
            await this.bugVersionService.hotfix(rows);
        }

        if (!latestMod) {
            latestMod = rows[0];
        }

        if (tags.length === 0) {
            // some sync error reason, will cause tags missing
            // set latest tag at least
            distTags['latest'] = latestMod.package.version;
        }

        var info = {
            name: name,
            modified: modifiedTime,
            'dist-tags': distTags,
            versions: versions,
        };


        ctx.jsonp = info;
        // use faster etag
        ctx.etag = etag([
            modifiedTime,
            distTags,
            allVersionString,
        ]);

        if (config.registryCacheControlHeader) {
            ctx.set('cache-control', config.registryCacheControlHeader);
        }
        if (config.registryVaryHeader) {
            ctx.set('vary', config.registryVaryHeader);
        }
    }

}