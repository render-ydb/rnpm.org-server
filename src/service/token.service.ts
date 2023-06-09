import { Inject, Provide,Scope, ScopeEnum} from "@midwayjs/core";
import { Json } from "../interface";
import crypto = require("crypto");
import uuid = require("uuid");
import { Token } from '../models';
import { TokenEntity } from "../entity/token.entity";
import { UserService } from "./user.service";



const DEFAULT_TOKEN_OPTIONS = {
    readonly: false,
    cidrWhitelist: [],
};

type TokenOptions = typeof DEFAULT_TOKEN_OPTIONS;

const DEFAULT_LIST_TOKEN_OPTIONS = {
    perPage: 10,
    page: 0,
};

// 对token进行哈希计算，生成一个长度为512的哈希值，并将其转换为16进制字符串格式输出
const createTokenKey = (token: string) => {
    return crypto.createHash('sha512').update(token).digest('hex');
}

// token脱敏处理，只保留前6位和后6位，中间用...替换
const redacteToken = (token: string) => {
    if (!token) {
        return null;
    }
    return `${token.substr(0, 6)}...${token.substr(-6)}`;
}

const convertToken = (row: TokenEntity, options: Json = {}) => {
    let token = row.token;
    if (options.redacte !== false) {
        token = redacteToken(token);
    }
    return {
        token: token,
        tokenKey: row.tokenKey,
        cidrWhitelist: row.cidrWhitelist,
        created: row.gmtCreate,
        updated: row.gmtCreate,
        readonly: row.readonly,
    };
}

@Provide()
@Scope(ScopeEnum.Request, { allowDowngrade: true })
export class TokenService {

    @Inject()
    userService: UserService

    async validateToken(token: string, options: Json) {
        const row = await Token.findByToken(token);
      
        if (!row) {
            return null;
        }

        const name = row.userId;
        const tokenObj = convertToken(row);
        // write operation and readonly token
        // validate fail
        if (!options.isReadOperation && tokenObj.readonly) {
            return null;
        }

        // has a cidr whitelist and access ip not in list
        // validate fail
        const cidrWhitelist = tokenObj.cidrWhitelist;
        if (cidrWhitelist.length && !cidrWhitelist.includes(options.accessIp)) {
            return null;
        }
        return await this.userService.get(name);
    }

    async createToken(userId: string, options: TokenOptions) {
        options = Object.assign({}, DEFAULT_TOKEN_OPTIONS, options);
        // 生成长度为36的随机UUID
        const token = uuid.v4();
        const key = createTokenKey(token);
        const tokenObj = {
            token: token,
            userId: userId,
            readonly: options.readonly,
            tokenKey: key,
            cidrWhitelist: options.cidrWhitelist,
        };
        const row = await Token.add(tokenObj);
        return convertToken(row, { redacte: false });
    }

    async listToken(userId: string, options: Json) {
        options = Object.assign({}, DEFAULT_LIST_TOKEN_OPTIONS, options);
        var rows = await Token.listByUser(userId, options.perPage * options.page, options.perPage);
        return rows.map(function (row) {
            return convertToken(row);
        });
    }

    async deleteToken(userId: string, keyOrToken: string) {
        await Token.deleteByKeyOrToken(userId, keyOrToken);
    }
}