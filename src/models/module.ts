import { ModuleEntity } from "../entity/module.entity";

class Module {

    model = ModuleEntity;

    async findByNameAndVersion(name: string, version) {
      
        return await ModuleEntity.findOne({
            where: { name: name, version: version }
        });
    }
    async findAll(args) {
        return await ModuleEntity.findAll(args);
    }   

    async findById(id) {
        return await ModuleEntity.findOne({
            where:{
                id
            }
        });
    } 

}

export = new Module();