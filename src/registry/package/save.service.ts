import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "../../service/package.service";
import { AppContext } from "../../interface";
import { DepreCateService } from "./deprecate.service";
import { getAuthorizeType, getCDNKey } from "../../lib";
import { AuthorizeType } from "../../lib";
import ssri = require("ssri");
import appConfig = require("../../appConfig");


// {
//     _id: '@cnpm/local-demo',
//     name: '@cnpm/local-demo',
//     description: '',
//     'dist-tags': { latest: '1.0.11' },
//     versions: {
//       '1.0.11': {
//         name: '@cnpm/local-demo',
//         version: '1.0.11',
//         description: '',
//         main: 'index.js',
//         scripts: [Object],
//         keywords: [Array],
//         author: '',
//         license: 'ISC',
//         dependencies: [Object],
//         readme: '# 我弄的11111',
//         readmeFilename: 'readme.md',
//         _id: '@cnpm/local-demo@1.0.11',
//         _nodeVersion: '16.17.0',
//         _npmVersion: '8.14.0',
//         dist: [Object]
//       }
//     },
//     access: null,
//     _attachments: {
//       '@cnpm/local-demo-1.0.11.tgz': {
//         content_type: 'application/octet-stream',
//         data: 'H4sIAAAAAAA...',
//         length: 726
//       }
//     }
//   }
@Provide()
export class SaveSerivce {
    @Inject()
    ctx: AppContext;

    @Inject()
    packageService: PackageService;

    @Inject()
    depreCateService: DepreCateService


    async savePackage(name, pkg) {
        const filename = Object.keys(pkg._attachments || {})[0];
        const version = Object.keys(pkg.versions || {})[0];
        const username = this.ctx.user.name; console.log(filename, version, username)
        if (!version) {
            this.ctx.status = 400;
            const error = '[version_error] package.versions is empty';
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }

        // check maintainers
        const result = await this.packageService.authMaintainer(name, username);
        if (!result.isMaintainer) {
            this.ctx.status = 403;
            const error = '[forbidden] ' + username + ' not authorized to modify ' + name +
                ', please contact maintainers: ' + result.maintainers.join(', ');
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }
        if (!filename) {
            let hasDeprecated = false;
            for (let v in pkg.versions) {
                const row = pkg.versions[v];
                if (typeof row.deprecated === 'string') {
                    hasDeprecated = true;
                    break;
                }
            }
            if (hasDeprecated) {
                return await this.depreCateService.deprecateVersions(name, pkg);
            }

            this.ctx.status = 400;
            const error = '[attachment_error] package._attachments is empty';
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }


        const attachment = pkg._attachments[filename];
        const versionPackage = pkg.versions[version];
        let maintainers = versionPackage.maintainers;
        const authorizeType = getAuthorizeType(this.ctx);
        if (!maintainers) {
            if (authorizeType === AuthorizeType.BEARER) {
                // With the token mode, pub lib with no maintainers
                // make the maintainer to be puber
                maintainers = [{
                    name: this.ctx.user.name,
                    email: this.ctx.user.email,
                }];
            } else {
                this.ctx.status = 400;
                const error = '[maintainers_error] request body need maintainers';
                this.ctx.body = {
                    error,
                    reason: error,
                };
                return;
            }
        }

        // notice that admins can not publish to all modules
        // (but admins can add self to maintainers first)

        let m = maintainers.filter(function (maintainer) {
            return maintainer.name === username;
        });

        // package.json has maintainers and publisher in not in the list
        if (authorizeType === AuthorizeType.BEARER && m.length === 0) {
            const publisher = {
                name: this.ctx.user.name,
                email: this.ctx.user.email,
            };
            m = [publisher];
            maintainers.push(publisher);
        }

        // make sure user in auth is in maintainers
        // should never happened in normal request
        if (m.length === 0) {
            this.ctx.status = 403;
            const error = '[maintainers_error] ' + username + ' does not in maintainer list';
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }

        // TODO: add this info into some table
        versionPackage._publish_on_cnpm = true;
        const distTags = pkg['dist-tags'] || {};
        const tags = []; // tag, version
        for (var t in distTags) {
            tags.push([t, distTags[t]]);
        }

        if (tags.length === 0) {
            this.ctx.status = 400;
            const error = '[invalid] dist-tags should not be empty';
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }

        const exists = await this.packageService.getModule(name, version);
        if (exists) {
            this.ctx.status = 403;
            const error = '[forbidden] cannot modify pre-existing version: ' + version;
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }

        // upload attachment
        let tarballBuffer: Buffer;
        tarballBuffer = Buffer.from(attachment.data, 'base64');
        if (tarballBuffer.length !== attachment.length) {
            this.ctx.status = 403;
            const error = '[size_wrong] Attachment size ' + attachment.length
                + ' not match download size ' + tarballBuffer.length;
            this.ctx.body = {
                error,
                reason: error,
            };
            return;
        }

        if (!distTags.latest) {
            const latest = await this.packageService.getModuleByTag(name, 'latest');
            if (!latest) {
                tags.push(['latest', tags[0][1]]);
            }
        }

        const originDist = versionPackage.dist || {};
        let shasum;
        let integrity = originDist.integrity;
        if (integrity) {
            const algorithm = ssri.checkData(tarballBuffer, integrity);
            if (!algorithm) {
                this.ctx.status = 400;
                const error = '[invalid] dist.integrity invalid';
                this.ctx.body = {
                    error,
                    reason: error,
                };
                return;
            }
            const integrityObj = ssri.fromData(tarballBuffer, {
                algorithms: ['sha1'],
            });
            shasum = integrityObj.sha1[0].hexDigest();
        } else {
            const integrityObj = ssri.fromData(tarballBuffer, {
                algorithms: ['sha512', 'sha1'],
            });
            integrity = integrityObj.sha512[0].toString();
            shasum = integrityObj.sha1[0].hexDigest();
            if (originDist.shasum && originDist.shasum !== shasum) {
                // if integrity not exists, check shasum
                this.ctx.status = 400;
                const error = '[invalid] dist.shasum invalid';
                this.ctx.body = {
                    error,
                    reason: error,
                };
                return;
            }
        }

        const options = {
            key: getCDNKey(name, filename),
            shasum,
            integrity
        }
        const uploadResult = await appConfig.nfs.uploadBuffer(tarballBuffer, options);
        const dist = Object.assign({}, originDist, {
            tarball: '',
            integrity: integrity,
            shasum: shasum,
            size: attachment.length,
        });

        if (uploadResult.url) {
            dist.tarball = uploadResult.url;
        } else if (uploadResult.key) {
            dist.key = uploadResult.key;
            dist.tarball = uploadResult.key;
        }

        const mod = {
            name: name,
            version: version,
            author: username,
            package: versionPackage
        };
        mod.package.dist = dist;
        await this.addDepsRelations(mod.package);
        const addResult = await this.packageService.saveModule(mod);

        if (tags.length) {
            for (let index = 0; index < tags.length; index++) {
                const tag = tags[index];
                await this.packageService.addModuleTag(name, tag[0], tag[1])
            }
        }

        const maintainerNames = maintainers.map(function (item) {
            return item.name;
        });
        await this.packageService.addPrivateModuleMaintainers(name, maintainerNames);

        this.ctx.status = 201;
        this.ctx.body = {
            ok: true,
            rev: String(addResult.id)
        }

        // hooks 埋点信息 ，自定义上报
        // const envelope = {
        //     event: 'package:publish',
        //     name: mod.name,
        //     type: 'package',
        //     version: mod.version,
        //     hookOwner: null,
        //     payload: null,
        //     change: null,
        // };
       

    }

    async addDepsRelations(pkg) {
        let dependencies = Object.keys(pkg.dependencies || {});
        if (dependencies.length > appConfig.maxDependencies) {
            dependencies = dependencies.slice(0, appConfig.maxDependencies);
        }
        await this.packageService.addDependencies(pkg.name, dependencies);
    }
}