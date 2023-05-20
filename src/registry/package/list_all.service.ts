import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "../../service/package.service";

@Provide()
export class ListAllService {
    @Inject()
    packageService: PackageService
    // GET /-/all
    // List all packages names
    // https://github.com/npm/npm-registry-client/blob/master/lib/get.js#L86
    async listAll() {
        const updated = Date.now();
        const names = await this.packageService.listAllPublicModuleNames();
        const result = { _updated: updated };
        names.forEach(function (name) {
            result[name] = true;
        });
        return result;
    }
}