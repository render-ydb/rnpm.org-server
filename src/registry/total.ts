import { Context } from "koa";
import appConfig = require("../appConfig");
import { Total } from '../models';


const TOTAL_MODULE_SQL = 'SELECT count(distinct(name)) AS count FROM module;';
const TOTAL_VERSION_SQL = 'SELECT count(name) AS count FROM module;';
const TOTAL_USER_SQL = 'SELECT count(name) AS count FROM user;';

class TotalService {

    async get(ctx: Context) {

    }
}

export = new TotalService();