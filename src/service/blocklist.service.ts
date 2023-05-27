import { Provide } from "@midwayjs/core";
import BlockPackageVersion = require("../models/block_package_version");

@Provide()
export class BlockListService {
    async blockPackageVersion(name:string, version:string, reason:string) {
        const row = await BlockPackageVersion.model.findOne({ where: { name, version } });
        if (row) {
            row.reason = reason;
            await row.save();
        } else {
            await BlockPackageVersion.model.create({ name, version, reason });
        }
    }

    async findBlockPackageVersions  (name:string) {
        const rows = await BlockPackageVersion.model.findAll({ where: { name } });
        if (rows.length === 0) {
          return null;
        }
        const blocks = {};
        for (const row of rows) {
          blocks[row.version] = row;
        }
        return blocks;
      }
}