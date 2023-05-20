import { ModuleEntity } from "../entity/module.entity";

class Module {
    async findByNameAndVersion(name: string, version) {
      
        return await ModuleEntity.findOne({
            where: { name: name, version: version }
        });
    }
    async findAll(args) {
        return await ModuleEntity.findAll(args);
    }   

}

export = new Module();