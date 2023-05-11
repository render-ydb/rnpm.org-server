
import crypto = require('crypto');
import path = require('path');
import utility = require('utility');
import util = require('util');
import appConfig = require('../appConfig');

const BASIC_PREFIX = /basic /i;
const BEARER_PREFIX = /bearer /i;
const TAG_NAME_REG = /^tag-(.+)\.json$/;
const PACKAGE_NAME_REG = /^package-(.+)\.json$/;

export const AuthorizeType = {
    BASIC: 'BASIC',
    BEARER: 'BEARER',
};


export const getTarballFilepath = (
    packageName: string,
    packageVersion: string,
    filename: string
) => {
    // ensure download file path unique
    // TODO: not only .tgz, and also other extname
    let name = filename.replace(/\.tgz$/, '.' + crypto.randomBytes(16).toString('hex'));
    // use filename string md5 instead, fix "ENAMETOOLONG: name too long" error
    name = packageName.replace(/\//g, '-').replace(/\@/g, '') + '-' + packageVersion.substring(0, 20) + '.' + utility.md5(name) + '.tgz';
    return path.join(appConfig.uploadDir, name);
}

export const getCDNKey = (name: string, fileName: string) => {
    // if name is scope package name, need to auto fix filename as a scope package file name
    // e.g.: @scope/foo, filename: foo-1.0.0.tgz => filename: @scope/foo-1.0.0.tgz
    if (name[0] === '@' && fileName[0] !== '@') {
        fileName = name.split('/')[0] + '/' + fileName;
    }
    return '/' + name + '/-/' + fileName;
}

export const getUnpublishFileKey = (name: string) => {
    return `/${name}/sync/unpublish/unpublish-package.json`;
};

export const getPackageFileCDNKey = (name: string, version: string) => {
    return `/${name}/sync/packages/package-${version}.json`;
};

export const getDistTagCDNKey = (name: string, tag: string) => {
    return `/${name}/sync/tags/tag-${tag}.json`;
};

export const getSyncTagDir = (name: string) => {
    return `${name}/sync/tags/`;
};

export const getSyncPackageDir = (name: string) => {
    return `${name}/sync/packages/`;
};

export const getTagNameFromFileName = (fileName: string) => {
    const res = fileName.match(TAG_NAME_REG);
    return res && res[1];
};

export const isBackupTagFile = (fileName: string) => {
    return TAG_NAME_REG.test(fileName);
};

export const getVersionFromFileName = (fileName: string) => {
    const res = fileName.match(PACKAGE_NAME_REG);
    return res && res[1];
};

export const isBackupPkgFile = (fileName: string) => {
    return PACKAGE_NAME_REG.test(fileName);
};

export const setDownloadURL = (
    pkg: Record<string, any>,
    ctx: Record<string, any>,
    host: string
) => {
    if (pkg.dist) {
        host = host || appConfig.registryHost || ctx.host;
        var protocol = appConfig.protocol || ctx.protocol;
        pkg.dist.tarball = util.format('%s://%s/%s/download/%s-%s.tgz',
            protocol,
            host, pkg.name, pkg.name, pkg.version);
    }
};

export const isAdmin = (username: string) => {
    return typeof appConfig.admins[username] === 'string';
};

export const isMaintainer = (user, maintainers) => {
    if (user.isAdmin) {
        return true;
    }
    const username = user.name;
    maintainers = maintainers || [];
    var match = maintainers.filter(function (item) {
        return item.name === username;
    });

    return match.length > 0;
};

export const isLocalModule = (mods: Array<Record<string, any>>) => {
    for (let i = 0; i < mods.length; i++) {
        let r = mods[i];
        if (appConfig.privatePackages.includes(r.name)) {
            return true;
        }
        if (r.package && r.package._publish_on_cnpm) {
            return true;
        }
    }
    return false;
}

export const isPrivateScopedPackage = (name) => {
    if (!name) {
        return false;
    }

    if (name[0] !== '@') {
        return false;
    }
    return appConfig.scopes.indexOf(name.split('/')[0]) >= 0;
}

export const etAuthorizeType = (ctx) => {
    var authorization = (ctx.get('authorization') || '').trim();
    if (BASIC_PREFIX.test(authorization)) {
        return AuthorizeType.BASIC;
    } else if (BEARER_PREFIX.test(authorization)) {
        return AuthorizeType.BEARER;
    }
}

export const isSyncWorkerRequest = (ctx) => {
    // sync request will contain this query params
    let isSyncWorkerRequest = ctx.query.cache === '0';
    if (!isSyncWorkerRequest) {
        const ua = ctx.headers['user-agent'] || '';
        // old sync client will request with these user-agent
        if (ua.indexOf('npm_service.cnpmjs.org/') !== -1) {
            isSyncWorkerRequest = true;
        }
    }
    return isSyncWorkerRequest;
}
