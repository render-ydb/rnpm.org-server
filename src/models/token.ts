import { TokenEntity } from "../entity/token.entity";
import { Json } from "../interface";
class Token {
    async findByToken(token: string) {
        return await TokenEntity.findOne({ where: { token: token } });
    }
    async add(tokenObj: Json) {
        const row = new TokenEntity(tokenObj)
        return await row.save();
    }
    async listByUser(userId: string, offset: number, limit: number) {
        return await TokenEntity.findAll({
            where: {
                userId: userId,
            },
            limit: limit,
            offset,
            order: [['id', 'ASC']]
        });
    }
    async deleteByKeyOrToken(userId:string, keyOrToken:string) {
        await TokenEntity.sequelize.transaction(function (t) {
          return TokenEntity.destroy({
            where: {
              userId: userId,
              $or: [
                { key: { like: keyOrToken + '%' } },
                { token: keyOrToken },
              ],
            },
            transaction: t,
          }).then(function (deleteRows) {
            // Key like query should not match more than 1 row
            if (deleteRows > 1) {
              throw new Error(`Token ID "${keyOrToken}" was ambiguous`);
            }
          });
        });
      }
}

export = new Token();