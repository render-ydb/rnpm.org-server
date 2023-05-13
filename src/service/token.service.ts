import { Inject, Provide } from "@midwayjs/core";
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

const DEFAULT_LIST_TOKEN_OPTIONS = {
    perPage: 10,
    page: 0,
};

const createTokenKey = (token: string) => {
    return crypto.createHash('sha512').update(token).digest('hex');
}

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

    async createToken(userId: string, options: Json) {
        options = Object.assign({}, DEFAULT_TOKEN_OPTIONS, options);
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