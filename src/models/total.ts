import { TotalEntity } from "../entity/total.entity";

class Total {
    async init(callback) {
        TotalEntity.findOne({
            where: { name: 'total' }
        }).then(row => {
            if (!row) {
                new TotalEntity({
                    name: 'total'
                })
                    .save()
                    .then(callback)
                    .catch(callback);
                return;
            }
            callback();
        })
            .catch(callback);
    }
}

export = new Total();