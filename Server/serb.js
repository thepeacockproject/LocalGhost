// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const path = require('path');
const uuid = require('uuid');
const { writeFile, readFile } = require('atomically');

const { extractToken, ServerVer } = require('./components/utils.js');
const profileHandler = require('./components/profileHandler.js');
const menuSystem = require('./components/menuSystem.js');
const menuData = require('./components/menuData.js');
const eventHandler = require('./components/eventHandler.js');
const multiplayerHandler = require('./components/multiplayerHandler.js');
const contractHandler = require('./components/contractHandler.js');

let app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`); // log every request to the console
    }
    next();
});

app.get('/config/pc-prod/7_17_0', (req, res) => {
    readFile('static/config.json').then((configfile) => {
        let config = JSON.parse(configfile);
        let serverhost = req.hostname;
        config.Versions[0].ISSUER_ID = req.query.issuer;
        config.Versions[0].SERVER_VER.Metrics.MetricsServerHost = `http://${serverhost}`;
        config.Versions[0].SERVER_VER.Authentication.AuthenticationHost = `http://${serverhost}`;
        config.Versions[0].SERVER_VER.Configuration.Url = `http://${serverhost}/files/onlineconfig.json`;
        config.Versions[0].SERVER_VER.Configuration.AgreementUrl = `http://${serverhost}/files/privacypolicy/hm2/privacypolicy.json`;
        config.Versions[0].SERVER_VER.Resources.ResourcesServicePath = `http://${serverhost}/files`;
        config.Versions[0].SERVER_VER.GlobalAuthentication.AuthenticationHost = `http://${serverhost}`;
        res.json(config);
    });
});

app.get('/files/privacypolicy/hm2/privacypolicy_*.json', (req, res) => {
    res.sendFile('static/privacypolicy.json', {
        root: '.',
        headers: {
            'Content-Type': 'application/octet-stream',
            'x-ms-meta-version': '20181001', // no idea what this is, but it didn't work without this header
        }
    });
});

app.post('/api/metrics/*', (req, res) => {
    res.send();
});

app.use('/oauth/token', express.urlencoded({ extended: false, type: 'application/json' }));
app.post('/oauth/token', async (req, res) => {
    if (req.body.grant_type == 'refresh_token') {
        extractToken(req);
        res.json({
            "access_token": req.jwt,
            "token_type": "bearer",
            "expires_in": 5000,
            "refresh_token": uuid.v4(),
        });
    }
    if (req.body.grant_type != 'external_steam' || !req.body.steam_userid) {
        res.status(501).end();
        return;
    }

    if (!/^\d{1,20}$/.test(req.body.steam_userid) ||
        req.body.pId && !/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(req.body.pId)) {
        res.status(400).end(); // user sent some nasty info
        return;
    }


    if (!req.body.pId) { // if no profile id supplied
        await readFile(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`)).then(data => { // get profile id from steam id
            // TODO: check legit server response
            req.body.pId = data;
        }).catch(async err => {
            if (err.code != 'ENOENT') {
                throw err; // rethrow if error is something else than a non-existant file
            }
            // steamid has no profile associated: create new profile and link steam id to it
            req.body.pId = uuid.v4();
            await writeFile(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`), req.body.pId, { fsyncWait: false });
        });
    } else { // if a profile id is supplied
        readFile(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`)).then(pId => { // read profile id linked to supplied steam id
            if (pId != req.body.pId) { // requested steam id is linked to different profile id
                // TODO: check legit server response
            }
        }).catch(async err => {
            if (err.code != 'ENOENT') {
                throw err; // rethrow if error is something else than a non-existant file
            }
            // steamid is not yet linked to this profile
            await writeFile(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`), req.body.pId, { fsyncWait: false }); // link it
        })
    }

    await readFile(path.join('userdata', 'users', `${req.body.pId}.json`)).then(data => {
        let userdata = JSON.parse(data);
        if (userdata.LinkedAccounts.steam != req.body.steam_userid) { // requested profile id is linked to different steam id
            // TODO: check legit server response
        }
    }).catch(async err => {
        if (err.code != 'ENOENT') {
            throw err; // rethrow if error is something else than a non-existant file
        }

        let userdata = JSON.parse(await readFile(path.join('userdata', 'default.json')));
        userdata.Id = req.body.pId;
        userdata.LinkedAccounts.steam = req.body.steam_userid;
        userdata.SteamId = req.body.steam_userid;
        // add all unlockables to player's inventory
        const allunlockables = JSON.parse(await readFile(path.join('userdata', 'allunlockables.json')));
        userdata.Extensions.inventory = allunlockables.map(unlockable => {
            unlockable.GameAsset = null;
            unlockable.DisplayNameLocKey = `UI_${unlockable.Id}_NAME`;
            return {
                InstanceId: uuid.v4(),
                ProfileId: req.body.pId,
                Unlockable: unlockable,
                Properties: {},
            }
        });
        //
        for (const unlockable of userdata.Extensions.inventory) {
            unlockable.ProfileId = req.body.pId;
        }
        await writeFile(path.join('userdata', 'users', `${req.body.pId}.json`), JSON.stringify(userdata), { fsyncWait: false });
    });

    const userinfo = {
        'auth:method': 'external_steam',
        roles: 'user',
        sub: req.body.pId,
        unique_name: req.body.pId,
        userid: req.body.steam_userid,
        platform: 'steam',
        locale: req.body.locale,
        rgn: req.body.rgn,
        pis: req.body.steam_appid,
        cntry: req.body.locale,
    };
    const authOptions = {
        notBefore: -60000,
        expiresIn: 6000,
        audience: 'pc_prod_7',
        issuer: 'auth.hitman.io',
        noTimestamp: true,
    };
    res.json({
        access_token: jwt.sign(userinfo, 'secret', authOptions),
        token_type: 'bearer',
        expires_in: 5000,
        refresh_token: uuid.v4(),
    });
});

app.get('/authentication/api/configuration/Init?*', extractToken, (req, res) => { // configName=pc-prod&lockedContentDisabled=false&isFreePrologueUser=false&isIntroPackUser=false&isFullExperienceUser=false
    let serverhost = req.hostname;
    res.json({
        token: `${req.jwt.exp}-${req.jwt.nbf}-steam-${req.jwt.userid}`,
        blobconfig: {
            bloburl: `http://${serverhost}/resources-7-17/`,
            blobsig: '?sv=2018-03-28',
            blobsigduration: 7200000.0
        },
        profileid: req.jwt.unique_name,
        serverversion: `${ServerVer._Major}.${ServerVer._Minor}.${ServerVer._Build}.${ServerVer._Revision}`,
        servertimeutc: new Date().toISOString(),
    });
});


app.head('/resources-7-17/dynamic_resources_pc_release_rpkg', (req, res) => {
    res.header('Content-Length', '1243589');
    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-MD5', 'lz1iZqwrWXdcPDFE2vVx/g==');
    res.header('Last-Modified', 'Tue, 19 Nov 2019 13:13:13 GMT');
    res.send();
});

app.get('/files/onlineconfig.json', (req, res) => {
    res.sendFile('static/onlineconfig.json', {
        root: '.',
        headers: {
            'Content-Type': 'application/octet-stream',
        },
    });
});

app.use('/authentication/api/userchannel/MultiplayerService/', multiplayerHandler);

app.use('/authentication/api/userchannel/EventsService/', eventHandler.router);

app.use('/authentication/api/userchannel/ContractsService/', contractHandler);

app.use('/authentication/api/userchannel/', profileHandler);

app.use('/resources-7-17/', menuSystem);

app.use('/profiles/page/', menuData);

app.get('/', (req, res) => {
    res.send('pog'); // simple test page
});

app.all('*', (req, res) => {
    console.warn(`unhandled ${req.method} ${req.url}`);
    res.status(404).end()
});

const httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || 80);
console.log('Server started.');
