// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const jwt = require('jsonwebtoken');
const path = require('path');
const { readFile } = require('atomically');


const ServerVer = {
    _Major: 7,
    _Minor: 17,
    _Build: 6,
    _Revision: 0
};

const UUIDRegex = /^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/;

function extractToken(req, res, next) {
    let auth = req.header('Authorization') ? req.header('Authorization').split(' ') : [];
    if (auth.length == 2 && auth[0] == "bearer") {
        req.jwt = jwt.decode(auth[1]); // I'm not going to verify the token
        if (!UUIDRegex.test(req.jwt.unique_name)) {
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

function maxLevelForLocation(location, gameVersion) {
    if (gameVersion == 'h3') {
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
            case 'LOCATION_NORTHAMERICA':
            case 'LOCATION_NORTHSEA':
            case 'LOCATION_GREEDY':
            case 'LOCATION_OPULENT':
            case 'LOCATION_AUSTRIA':
            case 'LOCATION_SALTY':
            case 'LOCATION_CAGED':
            case 'LOCATION_GOLDEN':
            case 'LOCATION_ANCESTRAL':
            case 'LOCATION_EDGY':
            case 'LOCATION_WET':
            case 'LOCATION_ELEGANT':
                return 20;
            case 'LOCATION_NEWZEALAND':
            case 'LOCATION_TRAPPED':
                return 5;
            case 'LOCATION_ICA_FACILITY':
                return 1;
        }
    } else {
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
    }
    return 1;
}

function getLocationCompletion(location, locationProgression) {
    return (locationProgression.Level == maxLevelForLocation(location)) ? 1 :
        (locationProgression.Xp - xpRequiredForLevel(locationProgression.Level)) /
        (xpRequiredForLevel(locationProgression.Level + 1) - xpRequiredForLevel(locationProgression.Level));
}

function getGameVersionFromJWTPis(pis) {
    switch (pis) { // set ServerVersion from jwt (appid from login token)
        case 'egp_io_interactive_hitman_the_complete_first_season': // hitman 1 epic
        case '236870': // hitman 1 steam appid
            return 'h1';
        case '863550': // hitman 2 steam appid
            return 'h2';
        case 'fghi4567xQOCheZIin0pazB47qGUvZw4': // hitman 3 epic
            return 'h3';
    }
    console.error(`Could not get version from jwt pis: ${pis}`);
    return 'h3';
}

function getGameVersionFromServerVersion(serverVersion) {
    if (serverVersion.startsWith('6')) {
        return 'h1';
    } else if (serverVersion.startsWith('7')) {
        return 'h2';
    } else if (serverVersion.startsWith('8')) {
        return 'h3';
    }
    console.error(`Could not get version from server version: ${serverVersion}`);
    return 'h3';
}

async function getTemplate(endpoint, gameVersion) {
    return await readFile(path.join('menudata', gameVersion, 'menudata', 'templates', `${endpoint}.json`)).then(fileData => {
        let json = JSON.parse(fileData);
        return JSON.parse(fileData);
    }).catch(err => {
        if (err.code != 'ENOENT') { // if other error than non-existant file
            console.log(err);
        }
        return null;
    });
}

module.exports = {
    extractToken,
    ServerVer,
    MaxPlayerLevel,
    xpRequiredForLevel,
    maxLevelForLocation,
    getLocationCompletion,
    getGameVersionFromJWTPis,
    getGameVersionFromServerVersion,
    getTemplate,
    UUIDRegex,
};
