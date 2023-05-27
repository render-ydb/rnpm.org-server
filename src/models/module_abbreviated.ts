import { ModuleAbbreviatedEntity } from "../entity/moduleAbbreviated.entity";

class ModuleAbbreviated {
    model = ModuleAbbreviatedEntity;
    async findByNameAndVersion(name, version) {
        return await ModuleAbbreviatedEntity.findOne({
            where: { name: name, version: version }
        });
    }

    async findAll(args) {
        return ModuleAbbreviatedEntity.findAll(args);
    }
}

export = new ModuleAbbreviated();