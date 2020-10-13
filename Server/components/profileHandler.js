// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const { writeFile, readFile } = require('atomically');


const { extractToken, MaxPlayerLevel } = require('./utils.js');

const app = express.Router();

// /authentication/api/userchannel/

app.post('/ProfileService/GetPlatformEntitlements', (req, res) => {
    // Steam AppIDs of Hitman2 and its DLCs
    res.json(["863550", "950540", "950550", "950551", "950552", "950553", "950554", "950555", "950556", "950557", "950558", "950559", "950560", "950561", "950562", "953090", "953091", "953092", "953093", "953094", "953095", "953096", "957690", "957691", "957692", "957693", "957694", "957695", "957696", "957697", "957698", "957730", "957731", "957733", "957735", "960831", "960832", "972340", "977941"]);
});

app.post('/AuthenticationService/GetBlobOfflineCacheDatabaseDiff', (req, res) => {
    // Which menu files should be loaded from the server?
    res.json([
        'menusystem/pages/hub/dashboard/dashboard.json',
        'menusystem/pages/hub/hub_content.json',
        'menusystem/pages/hub/dashboard/category_escalation/result.json',
        'menusystem/pages/result/versusresult_content.json',
        'menusystem/pages/multiplayer/content/lobbyslim.json',
    ]);
});

app.post('/ProfileService/UpdateUserSaveFileTable', (req, res) => {
    res.json('null');
});

app.post('/ProfileService/SynchronizeOfflineUnlockables', (req, res) => {
    res.json('null'); // TODO: write to inventory somewhere?
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
    let userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    for (let extension in userdata.Extensions) {
        if (!req.body.extensions.includes(extension)) {
            delete userdata[extension];
        }
    }

    res.json(userdata);
});

app.post('/UnlockableService/GetInventory', extractToken, async (req, res) => {
    res.json(JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`))).Extensions.inventory);
});

app.post('/ProfileService/UpdateExtensions', extractToken, express.json(), async (req, res) => {
    if (req.body.id != req.jwt.unique_name) { // data requested for different profile id
        res.status(403).end();
        return;
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    for (const extension in req.body.extensionsData) {
        userdata.Extensions[extension] = req.body.extensionsData[extension];
    }
    writeFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`), JSON.stringify(userdata), { fsyncWait: false });
    res.json(req.body.extensionsData);
});

async function resolveProfiles(profileIDs) {
    return (await Promise.allSettled(profileIDs.map(id => {
        if (!/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(id)) {
            return Promise.reject('Tried to resolve malformed profile id');
        }
        return readFile(path.join('userdata', 'users', `${id}.json`));
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
    res.json(await resolveProfiles(req.body.profileIDs));
});

app.post('/ProfileService/GetFriendsCount', extractToken, async (req, res) => {
    let userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    res.json(userdata.Extensions.friends.length);
});

app.post('/GamePersistentDataService/GetData', extractToken, express.json(), async (req, res) => {
    if (req.jwt.unique_name != req.body.userId) {
        res.status(403).end();
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.body.userId}.json`)));
    res.json(userdata.Extensions.gamepersistentdata[req.body.key]);
})

app.post('/GamePersistentDataService/SaveData', extractToken, express.json(), async (req, res) => {
    if (req.jwt.unique_name != req.body.userId) {
        res.status(403).end();
    }
    let userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.body.userId}.json`)));
    userdata.Extensions.gamepersistentdata[req.body.key] = req.body.data;
    writeFile(path.join('userdata', 'users', `${req.body.userId}.json`), JSON.stringify(userdata), { fsyncWait: false });

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
