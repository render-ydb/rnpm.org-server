import { ModuleUnpublishedEntity } from "../entity/moduleUnpublished.entity";

class ModuleUnpublished {
    async findByName(name: string) {
        return await ModuleUnpublishedEntity.findOne({
            where: {
                name: name
            }
        });
    }
    async save(name, pkg) {
        let row = await ModuleUnpublishedEntity.findOne({
            where: {
                name: name
            }
        });
        if (row) {
            row.package = pkg;
            if (row.changed()) {
                row = await row.save()
            }
            return row;
        }

        row = new ModuleUnpublishedEntity({
            name: name,
            package: pkg,
        });
        return row.save();
    }

    async findAll(args) {
        return await ModuleUnpublishedEntity.findAll(args);
    }   
}

export = new ModuleUnpublished();