const express = require('express');
const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken');
const path = require('path');
const uuid = require('uuid');

const { extractToken, ServerVer } = require ('./components/utils.js');
const profileHandler = require('./components/profileHandler.js');
const menuSystem = require('./components/menuSystem.js');
const menuData = require('./components/menuData.js');
const eventHandler = require('./components/eventHandler.js');
const multiplayerHandler = require('./components/multiplayerHandler.js');
const contractHandler = require('./components/contractHandler.js');

let app = express();

app.disable('x-powered-by');

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`); // log every request to the console
    next();
});

app.get('/config/pc-prod/7_17_0', (req, res) => {
    let config = JSON.parse(fs.readFileSync('static/config.json', 'utf8'));
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

app.get('/files/privacypolicy/hm2/privacypolicy_en.json', (req, res) => {
    let body = fs.readFileSync('static/privacypolicy_en.json');
    res.header('Content-Length', body.length);
    res.header('Content-Type', 'application/octet-stream');
    res.header('x-ms-meta-version', '20181001'); // no idea what this is, but it didn't work without this header
    res.send(body);
});

app.post('/api/metrics/*', (req, res) => {
    res.send();
});

app.use('/oauth/token', express.urlencoded({ extended: false, type: 'application/json' }));
app.post('/oauth/token', (req, res) => {
    if (req.body.grant_type == 'refresh_token') {
        extractToken(req);
        res.json({
            "access_token": req.jwt, // TODO
            "token_type": "bearer",
            "expires_in": 5000,
            "refresh_token": uuid.v4(),
        });
    }
    if (req.body.grant_type != 'external_steam') {
        res.status(501).end();
    }
    if (!req.body.pId) { // if no profile id supplied
        if (fs.existsSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`))) { // get profile id from steam id
            // TODO: check legit server response
            req.body.pId = fs.readFileSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`));
        } else { // create new profile id and link steam id to it
            req.body.pId = uuid.v4();
            fs.writeFileSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`), req.body.pId);
        }
    } else {
        if (!fs.existsSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`))) { // if steam id not yet linked, do so
            fs.writeFileSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`), req.body.pId);
        } else {
            let pId = fs.readFileSync(path.join('userdata', 'steamids', `${req.body.steam_userid}.json`));
            if (pId != req.body.pId) { // requested steam id is linked to different profile id
                // TODO: check legit server response
            }
        }
    }

    if (!fs.existsSync(path.join('userdata', 'users', `${req.body.pId}.json`))) { // set default data for new users
        let userdata = JSON.parse(fs.readFileSync(path.join('userdata', 'default.json')));
        userdata.Id = req.body.pId;
        userdata.LinkedAccounts.steam = req.body.steam_userid;
        userdata.SteamId = req.body.steam_userid;
        // add all unlockables to player's inventory
        const allunlockables = JSON.parse(fs.readFileSync(path.join('userdata', 'allunlockables.json')));
        let inventory = allunlockables.map(unlockable => {
            unlockable.GameAsset = null;
            unlockable.DisplayNameLocKey = `UI_${unlockable.Id}_NAME`;
            return {
                InstanceId: uuid.v4(),
                ProfileId: req.body.pId,
                Unlockable: unlockable,
                Properties: {},
            }
        });
        userdata.Extensions.inventory = inventory;
        //
        for (const unlockable of userdata.Extensions.inventory) {
            unlockable.ProfileId = req.body.pId;
        }
        fs.writeFileSync(path.join('userdata', 'users', `${req.body.pId}.json`), JSON.stringify(userdata));
    } else {
        let userdata = JSON.parse(fs.readFileSync(path.join('userdata', 'users', `${req.body.pId}.json`)));
        if (userdata.LinkedAccounts.steam != req.body.steam_userid) { // requested profile id is linked to different steam id
            // TODO: check legit server response
        }
    }

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
    let body = fs.readFileSync('static/onlineconfig.json');
    res.header('Content-Length', body.length);
    res.header('Content-Type', 'application/octet-stream');
    res.send(body);
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

httpServer.listen(80);
console.log('Server started.');
