import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "../../service/package.service";
import config = require("../../appConfig");
import { AppContext } from "../../interface";
import SyncModuleWorker = require("../../utils/sync_module.woker");

@Provide()

export class ShowService {
    @Inject()
    ctx: AppContext;

    @Inject()
    packageService: PackageService
    async show() {
        var name = this.ctx.params.name || this.ctx.params[0];
        var tag = this.ctx.params.version || this.ctx.params[1];
        var mod = await this.packageService.showPackage(name, tag, this.ctx);
        if (mod) {
            if (typeof config.formatCustomOnePackageVersion === 'function') {
                mod.package = config.formatCustomOnePackageVersion(mod.package);
            }

            this.ctx.jsonp = mod.package;
            if (config.registryCacheControlHeader) {
                this.ctx.set('cache-control', config.registryCacheControlHeader);
            }
            if (config.registryVaryHeader) {
                this.ctx.set('vary', config.registryVaryHeader);
            }
            return;
        }


        // if not fond, sync from source registry
        if (!this.ctx.allowSync) {
            this.ctx.status = 404;
            const error = '[not_exists] version not found: ' + tag;
            this.ctx.jsonp = {
                error,
                reason: error,
            };
            return;
        }
        // start sync
        await SyncModuleWorker.sync(name, 'sync-by-install');

        this.ctx.redirect(config.officialNpmRegistry + this.ctx.url);
    }
}