import { TagEntity } from "../entity/tag.entity";

class Tag {
    async findByNameAndTag(name, tag) {
        return await TagEntity.findOne({ where: { name: name, tag: tag } });
    }
    async findAll(args) {
        return await TagEntity.findAll(args);
    }
}

export = new Tag()