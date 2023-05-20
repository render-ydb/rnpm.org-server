
import { Inject, Provide } from "@midwayjs/core";
import { PackageService } from "../../service/package.service";
import lodash = require('lodash');


// GET /-/_changes?since={timestamp}&limit={number}&cursorId={number}
// List changes since the timestamp
// Similar with https://registry.npmmirror.com/_changes?since=1658974943840
// Change types:
// 1. ✅ PACKAGE_VERSION_ADDED
// 2. ✅ PACKAGE_TAG_ADDED
// 3. 🆕 PACKAGE_UNPUBLISHED
// 5. ❎ PACKAGE_MAINTAINER_REMOVED
// 6. ❎ PACKAGE_MAINTAINER_CHANGED
// 7. ❎ PACKAGE_TAG_CHANGED
//
// Since we don't have the previous data,
// We can't compute the reliable seqId
// use gmt_modified cinstead of seqId

@Provide()
export class ChangeService {
  @Inject()
  packageService: PackageService

  async listSince(query) {
    let { since, limit } = query;

    // ensure limit
    if (Number.isNaN(limit)) {
      limit = 1000;
    }

    const rs1 = await this.packageService.listVersionSince(since, limit);
    const rs2 = await this.packageService.listTagSince(since, limit);
    const rs3 = await this.packageService.listUnpublishedModuleSince(since, limit)

   
 

        var results = lodash.orderBy(
          lodash.flatten([rs1,rs2,rs3]).filter(Boolean),
          "gmt_modified",
          "asc"
        ).slice(0, limit);
      return {
        results
      };
  };
}


