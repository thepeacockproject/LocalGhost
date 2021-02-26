// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const { writeFile, readFile } = require('atomically');


const { extractToken, MaxPlayerLevel } = require('../utils.js');
const { getEntitlements } = require('./platformEntitlements.js');

const app = express.Router();

// /authentication/api/userchannel/

app.post('/ProfileService/GetPlatformEntitlements', express.json(), getEntitlements);

app.post('/AuthenticationService/GetBlobOfflineCacheDatabaseDiff', (req, res) => {
    // Which menu files should be loaded from the server?
    res.json([
        'menusystem/pages/hub/dashboard/dashboard.json',
        'menusystem/pages/hub/hub_page.json',
        'menusystem/pages/hub/dashboard/category_escalation/result.json',
        'menusystem/pages/result/versusresult_content.json',
        'menusystem/pages/multiplayer/content/lobbyslim.json',
    ]);
});

app.post('/ProfileService/UpdateUserSaveFileTable', (req, res) => {
    res.status(204).end();
});

app.post('/ProfileService/UpdateProfileStats', express.json(), async (req, res) => {
    if (req.jwt.unique_name != req.body.id) {
        res.status(403).end(); // data submitted for different profile id
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    
    userdata.Gamertag = req.body.gamerTag;
    userdata.Extensions.achievements = req.body.achievements;

    writeFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`), JSON.stringify(userdata), { fsyncWait: false });
    res.status(204).end();
});

app.post('/ProfileService/SynchronizeOfflineUnlockables', (req, res) => {
    res.status(204).end();
});

app.post('/ProfileService/GetUserConfig', (req, res) => {
    res.json({});
});

app.post('/ProfileService/GetProfile', extractToken, express.json(), async (req, res) => {
    if (req.body.id != req.jwt.unique_name) {
        res.status(403).end(); // data requested for different profile id
        console.log(`user ${req.jwt.unique_name} requested profile of ${req.body.id}`);
        return;
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    for (let extension in userdata.Extensions) {
        if (!req.body.extensions.includes(extension)) {
            delete userdata[extension];
        }
    }

    res.json(userdata);
});

app.post('/UnlockableService/GetInventory', extractToken, async (req, res) => {
    res.json(JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`))).Extensions.inventory);
});

app.post('/ProfileService/UpdateExtensions', extractToken, express.json(), async (req, res) => {
    if (req.body.id != req.jwt.unique_name) { // data requested for different profile id
        res.status(403).end();
        return;
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    for (const extension in req.body.extensionsData) {
        userdata.Extensions[extension] = req.body.extensionsData[extension];
    }
    writeFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`), JSON.stringify(userdata), { fsyncWait: false });
    res.json(req.body.extensionsData);
});

app.post('/ProfileService/SynchroniseGameStats', extractToken, express.json(), async (req, res) => {
    if (req.body.profileId != req.jwt.unique_name) { // data requested for different profile id
        res.status(403).end();
        return;
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));

    userdata.Extensions.gamepersistentdata.__stats = req.body.localStats;

    writeFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`), JSON.stringify(userdata), { fsyncWait: false });
    res.json({
        Inventory: userdata.Extensions.inventory,
        Stats: req.body.localStats,
    });
});

async function resolveProfiles(profileIDs, gameVersion) {
    return (await Promise.allSettled(profileIDs.map(id => {
        if (!/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(id)) {
            return Promise.reject('Tried to resolve malformed profile id');
        }
        return readFile(path.join('userdata', gameVersion, 'users', `${id}.json`));
    }))).map(outcome => {
        if (outcome.status == 'fulfilled') {
            let userdata = JSON.parse(outcome.value);
            userdata.Extensions = {};
            return userdata;
        } else {
            if (outcome.reason.code == 'ENOENT') {
                console.error(`Attempted to resolve unknown profile: ${path.basename(outcome.reason.path, '.json')}`);
                return null;
            } else {
                console.error(outcome.reason);
                return null;
            }
        }
    }).filter(data => data); // filter out nulls
}

app.post('/ProfileService/ResolveProfiles', express.json(), async (req, res) => {
    res.json(await resolveProfiles(req.body.profileIDs, req.gameVersion));
});

app.post('/ProfileService/ResolveGamerTags', express.json(), async (req, res) => {
    // Todo?: not sure how this works
    let profiles = await resolveProfiles(req.body.profileIds, req.gameVersion);
    let result = {};
    for (const profile of profiles) {
        if (profile.LinkedAccounts.dev) {
            result.dev = result.dev || {};
            result.dev[profile.Id] = null;
        } else if (profile.Gamertag){
            result.steam = result.steam || {};
            result.steam[profile.Id] = profile.Gamertag;
        }
    }
    
    res.json(result);
});

app.post('/ProfileService/GetFriendsCount', extractToken, async (req, res) => {
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    res.json(userdata.Extensions.friends.length);
});

app.post('/GamePersistentDataService/GetData', extractToken, express.json(), async (req, res) => {
    if (req.jwt.unique_name != req.body.userId) {
        res.status(403).end();
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.body.userId}.json`)));
    res.json(userdata.Extensions.gamepersistentdata[req.body.key]);
})

app.post('/GamePersistentDataService/SaveData', extractToken, express.json(), async (req, res) => {
    if (req.jwt.unique_name != req.body.userId) {
        res.status(403).end();
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.body.userId}.json`)));
    userdata.Extensions.gamepersistentdata[req.body.key] = req.body.data;
    writeFile(path.join('userdata', req.gameVersion, 'users', `${req.body.userId}.json`), JSON.stringify(userdata), { fsyncWait: false });

    res.json(null);
})

app.post('/ChallengesService/GetActiveChallengesAndProgression', extractToken, express.json(), async (req, res) => {
    const challenges = [];
    challenges.push(...JSON.parse(await readFile(path.join('challenges', 'global.json')))); // TODO: more challenges
    // TODO: location specific challenges

    for (const challenge of challenges) { // TODO: actual completion data
        challenge.Progression = {
            ChallengeId: challenge.Challenge.Id,
            ProfileId: req.jwt.unique_name,
            Completed: false,
            State: {},
            ETag: `W/\"datetime'${encodeURIComponent(new Date().toISOString())}'\"`,
            CompletedAt: null,
            MustBeSaved: false
        };
    }

    res.json(challenges);
});

app.post('/HubPagesService/GetChallengeTreeFor', extractToken, express.json(), (req, res) => {
    res.json({
        Data: {
            Children: [], // TODO: Challenges for location
        },
        LevelsDefinition: {
            Location: [ // TODO: xp required for each level in location
                0
            ],
            PlayerProfile: {
                Version: 1,
                XpPerLevel: 6000, // TODO: make dynamic?
                MaxLevel: MaxPlayerLevel,
            }
        }
    });
});

module.exports = {
    router: app,
    resolveProfiles
};
