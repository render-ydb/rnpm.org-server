import nodemailer = require('nodemailer');
import utility = require('utility');
import os = require('os');
import appConfig = require('../appConfig');
const mailConfig = appConfig.mail;



var transport;

/**
 * Send notice email with mail level and appname.
 *
 * @param {String|Array} to, email or email list.
 * @param {String} level, e.g.: 'log, warn, error'.
 * @param {String} subject
 * @param {String} html
 * @param {Function(err, result)} callback
 */
export const notice = (to: string, level: string, subject: string, html: string, callback?: Function) => {
    subject = '[' + mailConfig.appname + '] [' + level + '] [' + os.hostname() + '] ' + subject;
    html = String(html);
    send(to, subject, html.replace(/\n/g, '<br/>'), callback);
};

export const log = (to: string, subject: string, html: string, callback?: Function) => {
    notice(to, 'log', subject, html, callback);
};
export const warn = (to: string, subject: string, html: string, callback?: Function) => {
    notice(to, 'warn', subject, html, callback);
};
export const error = (to: string, subject: string, html: string, callback?: Function) => {
    notice(to, 'error', subject, html, callback);
};

/**
 * Send email.
 * @param {String|Array} to, email or email list.
 * @param {String} subject
 * @param {String} html
 * @param {Function(err, result)} callback
 */
export const send = (to: string, subject: string, html: string, callback: Function= utility.noop) => {
    if (mailConfig.enable === false) {
        console.log('[send mail debug] [%s] to: %s, subject: %s\n%s', Date(), to, subject, html);
        return callback();
    }

    if (!transport) {
        transport = nodemailer.createTransport(mailConfig);
    }

    const message = {
        from: mailConfig.from,
        to: to,
        subject: subject,
        html: html,
    };

    transport.sendMail(message, function (err, result) {
        callback(err, result);
    });
};
