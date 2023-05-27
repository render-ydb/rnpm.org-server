import { Provide } from "@midwayjs/core";
import ms = require("humanize-ms");
import cleanNpmMetadata = require('normalize-registry-metadata');
import config = require("../appConfig");
import urllib from "../common/urllib";
var USER_AGENT = 'npm_service.cnpmjs.org/' + config.version + ' ' + urllib.USER_AGENT;

@Provide()
export class NpmService {
    async request(url: string, options?) {
        options = options || {};
        options.dataType = options.dataType || 'json';
        options.timeout = options.timeout || 120000;
        options.headers = Object.assign({
            'user-agent': USER_AGENT
        }, options.headers);
        options.gzip = true;
        options.followRedirect = true;
        var registry = options.registry || config.sourceNpmRegistry;
        url = registry + url;
        var r;
        try {
            r = await urllib.request(url, options);
            // https://github.com/npm/registry/issues/87#issuecomment-261450090
            if (options.dataType === 'json' && r.data && config.officialNpmReplicate === registry) {
                cleanNpmMetadata(r.data);
            }
        } catch (err) {
            var statusCode = err.status || -1;
            var data = err.data || '[empty]';
            if (err.name === 'JSONResponseFormatError' && statusCode >= 500) {
                err.name = 'NPMServerError';
                err.status = statusCode;
                err.message = 'Url: ' + url + ', Status ' + statusCode + ', ' + data.toString();
            }
            throw err;
        }
        return r;
    }

    async getUser(name: string) {
        var url = '/-/user/org.couchdb.user:' + name;
        var r = await this.request(url);
        var data = r.data;
        if (data && !data.name) {
            // 404
            data = null;
        }
        return data;
    }

    async fetchUpdatesSince(lastSyncTime: number, timeout: number) {
        var lastModified = lastSyncTime - ms('10m');
        var data = await this.getAllSince(lastModified, timeout);
        var result = {
            lastModified: lastSyncTime,
            names: [],
        };
        if (!data) {
            return result;
        }
        if (Array.isArray(data)) {
            // support https://registry.npmjs.org/-/all/static/today.json
            var maxModified;
            data.forEach(function (pkg) {
                if (pkg.time && pkg.time.modified) {
                    var modified = Date.parse(pkg.time.modified);
                    if (modified >= lastModified) {
                        result.names.push(pkg.name);
                    }
                    if (!maxModified || modified > maxModified) {
                        maxModified = modified;
                    }
                } else {
                    result.names.push(pkg.name);
                }
            });
            if (maxModified) {
                result.lastModified = maxModified;
            }
        } else {
            // /-/all/since
            if (data._updated) {
                result.lastModified = data._updated;
                delete data._updated;
            }
            result.names = Object.keys(data);
        }
        return result;
    }
    async fetchAllPackagesSince(timestamp: number) {
        var r = await this.request('/-/all/static/all.json', {
            registry: 'http://registry.npmjs.org',
            timeout: 600000
        });
        // {"_updated":1441520402174,"0":{"name":"0","dist-tags
        // "time":{"modified":"2014-06-17T06:38:43.495Z"}
        var data = r.data;
        var result = {
            lastModified: timestamp,
            lastModifiedName: null,
            names: [],
        };
        var maxModified;
        for (var key in data) {
            if (key === '_updated') {
                continue;
            }
            var pkg = data[key];
            if (!pkg.time || !pkg.time.modified) {
                continue;
            }
            var modified = Date.parse(pkg.time.modified);
            if (modified >= timestamp) {
                result.names.push(pkg.name);
            }
            if (!maxModified || modified > maxModified) {
                maxModified = modified;
                result.lastModifiedName = pkg.name;
            }
        }
        if (maxModified) {
            result.lastModified = maxModified;
        }
        return result;
    }
    async getAllSince(startkey: number, timeout) {
        var r = await this.request('/-/all/since?stale=update_after&startkey=' + startkey, {
            timeout: timeout || 300000
        });
        return r.data;
    }

    async getAllToday(timeout: number) {
        var r = await this.request('/-/all/static/today.json', {
            timeout: timeout || 300000
        });
        // data is array: see https://registry.npmjs.org/-/all/static/today.json
        return r.data;
    }

    async getShort(timeout: number) {
        const registry = config.sourceNpmRegistryIsCNpm ? config.sourceNpmRegistry : 'https://registry.npmmirror.com';
        var r = await this.request('/-/short', {
            timeout: timeout || 300000,
            // registry.npmjs.org/-/short is 404 now therefore have a fallback
            registry: registry,
        });
        if (r.status !== 200) {
            const data = r.data;
            if (data && data.code && data.message) {
                // { code: 'MethodNotAllowedError', message: 'GET is not allowed' }
                const url = registry + '/-/short';
                const err = new Error(data.message + ', url: ' + url);
                err.name = data.code;
                // @ts-ignore
                err.url = url;
                throw err;
            }
        }
        return r.data;
    }
    async getPopular(top: number, timeout: number) {
        var r = await this.request('/-/_view/dependedUpon?group_level=1', {
            registry: config.officialNpmRegistry,
            timeout: timeout || 120000
        });
        if (!r.data || !r.data.rows || !r.data.rows.length) {
            return [];
        }

        // deps number must >= 100
        var rows = r.data.rows.filter(function (a) {
            return a.value >= 100;
        });

        return rows.sort(function (a, b) {
            return b.value - a.value;
        })
            .slice(0, top)
            .map(function (r) {
                return [r.key && r.key[0] && r.key[0].trim(), r.value];
            })
            .filter(function (r) {
                return r[0];
            });
    }

    async getChangesUpdateSeq() {
        const registry = config.sourceNpmRegistryIsCNpm ? config.sourceNpmRegistry : 'https://registry.npmmirror.com';
        const r = await this.request('/', {
            timeout: 30000,
            registry: registry,
        });
        const data = r.data || {};
        if (r.status !== 200) {
            if (data.code && data.message) {
                const url = registry + '/';
                const err = new Error(data.message + ', url: ' + url);
                err.name = data.code;
                // @ts-ignore
                err.url = url;
                throw err;
            }
        }
        return data.update_seq || 0;
    }

    async listChanges(updateSeq: string) {
        const registry = config.sourceNpmRegistryIsCNpm ? config.sourceNpmRegistry : 'https://registry.npmmirror.com';
        const changesUrl = `/_changes?since=${updateSeq}`;
        const r = await this.request(changesUrl, {
            timeout: 30000,
            registry: registry,
        });
        const data = r.data || {};
        if (r.status !== 200) {
            if (data.code && data.message) {
                const url = registry + changesUrl;
                const err = new Error(data.message + ', url: ' + url);
                err.name = data.code;
                // @ts-ignore
                err.url = url;
                throw err;
            }
        }
        // {"results":[{"seq":1988653,"type":"PACKAGE_VERSION_ADDED","id":"dsr-package-mercy-magot-thorp-sward","changes":[{"version":"1.0.1"}]},
        return data.results || [];
    }

    async getScopePackagesShort(scope: string, registry: string) {
        var response = await this.request('/browse/keyword/' + scope, {
            timeout: 3000,
            registry: registry,
            dataType: 'text'
        });
        var res = response.data.match(/class="package-name">(\S*)<\/a>/g)
        return res ? res.map(a => a.match(/class="package-name">(\S*)<\/a>/)[1]).filter(name => name.indexOf(`${scope}/`) === 0) : []
    }
}