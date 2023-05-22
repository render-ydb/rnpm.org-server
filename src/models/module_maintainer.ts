import { ModuleMaintainerEntity } from "../entity/moduleMaintainer.entity";

class ModuleMaintainer {
    async listModuleNamesByUser(user: string) {
        const rows = await ModuleMaintainerEntity.findAll({
            attributes: ['name'],
            where: {
                user: user
            }
        });
        return rows.map(function (row) {
            return row.name;
        });
    };

    async listMaintainers(name: string) {
        const rows = await ModuleMaintainerEntity.findAll({
            attributes: ['user'],
            where: {
                name: name
            }
        });
        return rows.map(function (row) {
            return row.user;
        });
    };

    async addMaintainer(name: string, user: string) {
        let row = await ModuleMaintainerEntity.findOne({
            where: {
                user: user,
                name: name
            }
        });
        if (!row) {
            row = await ModuleMaintainerEntity.build({
                user: user,
                name: name
            }).save();
        }
        return row;
    }
    async addMaintainers(name: string, users: Array<string>) {
        return await users.map((user) => {
            return this.addMaintainer(name, user);
        });

    }

    async removeMaintainers(name: string, users: Array<string> | string) {
        // removeMaintainers(name, oneUserName)
        if (typeof users === 'string') {
            users = [users];
        }
        if (users.length === 0) {
            return;
        }
        await ModuleMaintainerEntity.destroy({
            where: {
                name: name,
                user: users,
            }
        });
    }

    async removeAllMaintainers(name: string) {
        await ModuleMaintainerEntity.destroy({
            where: {
                name: name
            }
        });
    }

    async updateMaintainers(name: string, users: Array<string>) {
        // maintainers should be [username1, username2, ...] format
        // find out the exists maintainers
        // then remove all the users not present and add all the left

        if (users.length === 0) {
            return {
                add: [],
                remove: []
            };
        }
        const exists = await this.listMaintainers(name);

        const addUsers = users.filter(function (username) {
            // add user which in `users` but do not in `exists`
            return exists.indexOf(username) === -1;
        });

        const removeUsers = exists.filter(function (username) {
            // remove user which in `exists` by not in `users`
            return users.indexOf(username) === -1;
        });

        await this.addMaintainers(name, addUsers);
        await this.removeMaintainers(name, removeUsers);

        return {
            add: addUsers,
            remove: removeUsers
        };
    }
}

export = new ModuleMaintainer();