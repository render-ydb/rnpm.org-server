import crypto = require('crypto');
import utility = require('utility');

export = (user, body) => {
    if (!user.password_sha && body.password) {
        // create password_sha on server
        user.salt = crypto.randomBytes(30).toString('hex');
        user.password_sha = utility.sha1(body.password + user.salt);
    }
};