import formater = require('error-formater');
import Logger = require('mini-logger');
import utility = require('utility');
import util = require('util');
import os = require('os');
import config = require('../appConfig');
import * as mail from './mail';

const isTEST = process.env.NODE_ENV === 'test';
const categories = ['sync_info', 'sync_error'];

const errorFormater = (err) => {
    const msg = formater.both(err);
    mail.error(to, msg.json.name, msg.text);
    return msg.text;
}
const logger = Logger({
    categories: categories,
    dir: config.logdir,
    duration: '1d',
    format: '[{category}.]YYYY-MM-DD[.log]',
    stdout: config.debug && !isTEST,
    errorFormater: errorFormater,
    seperator: os.EOL,
});

const to: string = config.admins.render;



logger.syncInfo = function () {
    const args = [].slice.call(arguments);
    if (typeof args[0] === 'string') {
        // @ts-ignore
        args[0] = util.format('[%s][%s] ', utility.logDate(), process.pid) + args[0];
    }
    logger.sync_info.apply(logger, args);
};

logger.syncError = function () {
    const args = [].slice.call(arguments);
    if (typeof args[0] === 'string') {
        // @ts-ignore
        args[0] = util.format('[%s][%s] ', utility.logDate(), process.pid) + args[0];
    }
    logger.sync_error.apply(logger, arguments);
};

export = logger;