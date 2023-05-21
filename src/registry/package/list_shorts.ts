import { PackageService } from "../../service/package.service";
import config = require("../../appConfig");
import { Inject, Provide } from "@midwayjs/core";

@Provide()
export class ListShortsService{
    @Inject()
    packageService:PackageService

    async listShorts(query){
        const {private_only} = query;
        if (private_only) {
            const tasks = [];
            for (let i = 0; i < config.scopes.length; i++) {
              const scope = config.scopes[i];
              tasks.push(await this.packageService.listPrivateModulesByScope(scope));
            }
        
            if (config.privatePackages && config.privatePackages.length > 0) {
              tasks.push(this.packageService.listModules(config.privatePackages));
            }
        
            const results = await tasks;
            const names = [];
            for (const rows of results) {
              for (const row of rows) {
                names.push(row.name);
              }
            }
            return names
          }
        
          return await this.packageService.listAllPublicModuleNames();
    }

}