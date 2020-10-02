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

const MaxPlayerLevel = 5000;

function xpRequiredForLevel(level) {
    return level * 6000 - 6000;
}

function maxLevelForLocation(location) {
    switch (location.toUpperCase()) {
        case 'LOCATION_PARIS':
        case 'LOCATION_PARENT_COASTALTOWN':
        case 'LOCATION_MARRAKECH':
        case 'LOCATION_COLORADO':
        case 'LOCATION_BANGKOK':
        case 'LOCATION_HOKKAIDO':
        case 'LOCATION_MIAMI':
        case 'LOCATION_COLOMBIA':
        case 'LOCATION_MUMBAI':
        case 'LOCATION_NORTHSEA':
        case 'LOCATION_OPULENT':
        case 'LOCATION_AUSTRIA':
        case 'LOCATION_SALTY':
        case 'LOCATION_CAGED':
            return 20;
        case 'LOCATION_GREEDY':
        case 'LOCATION_NORTHAMERICA':
            return 15;
        case 'LOCATION_NEWZEALAND':
            return 5;
        case 'LOCATION_ICA_FACILITY':
            return 1;
    }
    return 1;
}

module.exports = {
    extractToken,
    ServerVer,
    MaxPlayerLevel,
    xpRequiredForLevel,
    maxLevelForLocation,
};
