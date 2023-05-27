import { Inject, Provide } from "@midwayjs/core";
import config = require("../appConfig");
import { PackageService } from "./package.service";


@Provide()
export class BugVersionService {
    @Inject()
    packageService: PackageService
    async hotfix(rows) {
        if (!config.enableBugVersion) {
            return;
        }
        let row = rows[0];
        if (!row) {
            return;
        }
        // https://github.com/cnpm/bug-versions/blob/master/package.json#L118
        // "config": {
        //   "bug-versions": {
        //     "gifsicle": {
        //       "5.3.0": {
        //         "version": "5.2.1",
        //         "reason": "https://github.com/imagemin/gifsicle-bin/issues/133"
        //       }
        //     },
        const moduleRow = await this.packageService.getLatestModule('bug-versions');
        if (!moduleRow) {
            return;
        }
        // @ts-ignore
        const bugVersions = moduleRow.package.config && moduleRow.package.config['bug-versions'];
        const bugs = bugVersions && bugVersions[row.package.name];
        if (!bugs) {
          return;
        }

        const existsVerionsMap = {};
        for (row of rows) {
          existsVerionsMap[row.package.version] = row.package;
        }

        for (row of rows) {
            const bug = bugs[row.package.version];
            if (bug && bug.version && existsVerionsMap[bug.version]) {
              const packageJSON = JSON.parse(JSON.stringify(existsVerionsMap[bug.version]));
              const hotfixDeprecated = `[WARNING] Use ${bug.version} instead of ${row.package.version}, reason: ${bug.reason}`;
              packageJSON.deprecated = row.package.deprecated ? `${row.package.deprecated} (${hotfixDeprecated})` : hotfixDeprecated;
              // don't change version
              packageJSON.version = row.package.version;
              Object.assign(row.package, packageJSON);
            }
          }
    }
}