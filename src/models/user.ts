import { UserEntity } from "../entity/user.entity";
import utility = require("utility");

class UserModel {

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
}

export = new UserModel()