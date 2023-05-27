import { PackageReadmeEntity } from "../entity/packageReadme.entity";


class PackageReadme {
    model = PackageReadmeEntity;
    async findByName(name: string) {
        return await PackageReadmeEntity.findOne({
            where: { name: name },
        });
    }
}

export = new PackageReadme;