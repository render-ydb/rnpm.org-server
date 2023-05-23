import { ModuleKeywordEntity } from "../entity/moduleKeyword.entity";

class ModuleKeyword {
    model = ModuleKeywordEntity;
    async findByKeywordAndName(keyword: string, name: string) {
        return await ModuleKeywordEntity.findOne({
            where: {
                keyword: keyword,
                name: name
            }
        });
    }
}

export = new ModuleKeyword;