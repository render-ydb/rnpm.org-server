import { UserEntity } from "../entity/user.entity";
import utility = require("utility");
import { Json } from "../interface";
import { Op } from "sequelize";


class UserModel {
    model=UserEntity;
    // 根据password和salt，得到特定哈希值
    createPasswordSha(password: string, salt: string) {
        return utility.sha1(password + salt);
    }

    // 根据passwordSha的值判断用户是否存在
    async auth(name: string, password: string) {
        let user = await this.findByName(name);
        if (user) {
            const sha = this.createPasswordSha(password, user.salt);
            if (user.passwordSha !== sha) {
                user = null;
            }
        }
        return user;
    }

    async findByName(name: string) {
        return await UserEntity.findOne({
            where: { name }
        })
    }

    async listByNames(names: Array<string>) {
        if (!names || names.length === 0) {
            return [];
        }
        return await UserEntity.findAll({
            where: {
                name: {
                    [Op.in]: names
                }
            }
        });
    }

    async search(query: string, options: Json) {
        return await UserEntity.findAll({
            where: {
                name: {
                    like: query + '%'
                }
            },
            limit: options.limit
        });
    }

    async saveNpmUser(data: Json) {
        let user = await this.findByName(data.name);
        if (!user) {
            user = new UserEntity({
                npmUser: true,
                name: data.name,
                salt: '0',
                passwordSha: '0',
                ip: '0'
            })
        }
        user.npmUser = true;
        user.json = JSON.stringify(data);
        user.email = data.email || '';
        user.rev = data._rev || '';
        if (user.changed()) {
            user = await user.save();
        }
        return user;
    }

    async saveCustomUser(data: Json) {
        const name = data.user.login;
        let user = await this.findByName(name);
        if (!user) {
            user = new UserEntity({
                isNpmUser: false,
                name: name,
            });
        }

        const rev = '1-' + data.user.login;
        const salt = data.salt || '0';
        const passwordSha = data.password_sha || '0';
        const ip = data.ip || '0';

        user.npmUser = false;
        user.email = data.user.email;
        user.ip = ip;
        user.json = data.user;
        user.rev = rev;
        user.salt = salt;
        user.passwordSha = passwordSha;
        if (user.changed()) {
            user = await user.save();
        }
        return user;
    }

    // add new user
    async add(user: Json) {
        let roles: Array<string> | string = user.roles || [];
        try {
            roles = JSON.stringify(roles);
        } catch (e) {
            roles = '[]';
        }
        const rev = '1-' + utility.md5(JSON.stringify(user));

        const row = new UserEntity({
            rev: rev,
            name: user.name,
            email: user.email,
            salt: user.salt,
            passwordSha: user.password_sha,
            ip: user.ip,
            roles: roles,
            npmUser: false,
        });

        return await row.save();
    }

    async update(user: Json) {
        const rev: string = user.rev || user._rev;
        let revNo = Number(rev.split('-', 1));
        if (!revNo) {
            const err = new Error(rev + ' format error');
            err.name = 'RevFormatError';
            // @ts-ignore
            err.data = { user: user };
            throw err;
        }
        revNo++;
        const newRev = revNo + '-' + utility.md5(JSON.stringify(user));
        let roles = user.roles || [];
        try {
            roles = JSON.stringify(roles);
        } catch (e) {
            roles = '[]';
        }

        const row = await this.findByName(user.name);
        if (!row) {
            return null;
        }

        row.rev = newRev;
        row.email = user.email;
        row.salt = user.salt;
        row.passwordSha = user.password_sha;
        row.ip = user.ip;
        row.roles = roles;
        row.npmUser = false;

        return await row.save({
            fields: ['rev', 'email', 'salt', 'passwordSha', 'ip', 'roles', 'npmUser']
        });
    }

}

export = new UserModel()