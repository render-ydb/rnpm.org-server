import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "../../service/package.service";
import { ModuleEntity } from "../../entity/module.entity";
import { Context } from "@midwayjs/koa";

@Provide()
export class DepreCateService {
    @Inject()
    packageService: PackageService;

    @Inject()
    ctx: Context

    async deprecateVersions(name, body) {
        let rs: Array<ModuleEntity> = [];
        for (let version in body.versions) {
            rs.push(await this.packageService.getModule(name, version))
        }
        rs = rs.filter(Boolean);
      
        for (let i = 0; i < rs.length; i++) {
            const row = rs[i];
            if (!row) {
                // some version not exists
                this.ctx.status = 400;
                const error = '[version_error] Some versions: ' + JSON.stringify(Object.keys(body.versions)) + ' not found';
                this.ctx.body = {
                    error,
                    reason: error,
                };
                return;
            }
            // @ts-ignore
            const data = body.versions[row.package.version];
            if (typeof data.deprecated === 'string') {
                // @ts-ignore
                row.package.deprecated = data.deprecated;
                await this.packageService.updateModulePackage(row.id, row.package);
            }
        }
        // 自动会修改时间不？
        await this.packageService.updateModuleLastModified(name);

        this.ctx.status = 201;
        this.ctx.body = {
            ok: true,
        };
    }
}