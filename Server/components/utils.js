// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const jwt = require('jsonwebtoken');

const ServerVer = {
    _Major: 7,
    _Minor: 17,
    _Build: 6,
    _Revision: 0
};

function extractToken(req, res, next) {
    let auth = req.header('Authorization') ? req.header('Authorization').split(' ') : [];
    if (auth.length == 2 && auth[0] == "bearer") {
        req.jwt = jwt.decode(auth[1]); // I'm not going to verify the token
        if (!/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(req.jwt.unique_name)) {
            res.status(400).end(); // user sent some nasty info
            next && next('user tried to send dirty auth header');
            return;
        }
        next && next();
        return;
    }
    res.status(401).end();
    next && next('invalid auth token');
}

module.exports = {
    extractToken,
    ServerVer,
};
