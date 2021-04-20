// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const uuid = require('uuid');
const { readFile } = require('atomically');

const { extractToken, MaxPlayerLevel, xpRequiredForLevel, maxLevelForLocation, getTemplate, UUIDRegex } = require('../utils.js');
const { resolveProfiles } = require('./profileHandler.js');
const { contractSessions } = require('./eventHandler.js');
const scoreHandler = require('./scoreHandler.js');

const app = express.Router();

// /profiles/page/

app.get('/dashboard/Dashboard_Category_:category/:subscriptionId/:type/:id/:mode', extractToken, async (req, res) => {
    const userData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    const repoData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'allunlockables.json')));
    let contractIds = [];

    if (req.params.type == 'ContractList') {
        if (req.params.subscriptionId == '10000000-0000-0000-0000-000000000000') {
            await readFile(path.join('menudata', req.gameVersion, 'featuredContracts.json')).then(file => {
                contractIds = JSON.parse(file);
            }).catch(err => {
                if (err.code != 'ENOENT') {
                    console.error(err);
                } // use empty array if no featuredContracts.json exists
            });
        } else {
            res.status(404).send('Subscription item not found');
            return;
        }
    } else if (req.params.type == 'Contract') {
        if (!UUIDRegex.test(req.params.id)) {
            res.status(400).send('id was not a uuid');
            return;
        }
        contractIds = [req.params.id];
    }

    const contracts = (await Promise.allSettled(contractIds.map(id => {
        return readFile(path.join('contractdata', `${id}.json`)).then(file => {
            return generateUserCentric(JSON.parse(file), userData, req.gameVersion, repoData);
        });
    }))).map(outcome => {
        if (outcome.status == 'fulfilled') {
            return outcome.value;
        } else {
            if (outcome.reason.code == 'ENOENT') {
                console.error(`Attempted to resolve unknown contract: ${path.basename(outcome.reason.path, '.json')}`);
                return null;
            } else {
                console.error(outcome.reason);
                return null;
            }
        }
    }).filter(data => data); // filter out nulls

    let item = {};
    if (req.params.type == 'ContractList') {
        item = {
            Id: req.params.id,
            Type: 'ContractList',
            Title: 'ContractList',
            Date: new Date().toISOString(),
            Data: contracts.length > 0 ? contracts : null,
        };
    } else if (req.params.type == 'Contract') {
        if (contracts.length != 1) {
            res.status(404).send('Subscription item not found');
            return;
        }
        item = {
            Id: req.params.id,
            Type: 'Contract',
            Title: contracts[0].Contract.Metadata.Title,
            Date: new Date().toISOString(),
            Data: contracts[0],
        };
    } else if (req.params.type == 'NoContent') {
        item = {
            Id: null,
            Type: "NoContent",
            Title: null,
            Date: "0001-01-01T00:00:00Z",
            Data: null
        };
    } else {
        // TODO? Are there more types?
        res.status(400).send('unknown type');
        return;
    }

    res.json({
        template: req.params.mode == 'dataonly' ? null : await getTemplate('dashboard_category', req.gameVersion),
        data: {
            Item: item,
        },
    });
});

app.get('/Hub', extractToken, async (req, res) => {
    const userdata = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    const serverTile = await readFile(path.join('menudata', 'h3', 'serverTile.json')).then(file => {
        return JSON.parse(file);
    }).catch(async err => {
        if (err.code != 'ENOENT') {
            throw err;
        }
        return JSON.parse(await readFile(path.join('menudata', 'h3', 'serverTile.template.json'))); // use template if no custom serverTile.json exists
    });
    res.json({
        template: await getTemplate('hub', req.gameVersion),
        data: {
            ServerTile: serverTile,
            DashboardData: [{
                Id: '25739126-6a40-4b0b-b9a6-5da1b737190b',
                Type: 'ContractList',
                Title: 'UI_HEADLINE_PLAY_CONTRACT_ATTACK',
                Text: 'UI_CONTRACT_LOTUS_GROUP_TITLE',
                Date: '2020-01-01T00:00:00.0000000Z',
                SubscriptionId: '10000000-0000-0000-0000-000000000000',
                Priority: 40.0,
                Properties: {
                    ContractId: '25739126-6a40-4b0b-b9a6-5da1b737190b',
                    DashboardCategory: 'Dashboard_Category_Escalation',
                },
            }], // TODO
            DestinationsData: [], // TODO
            CreateContractTutorial: {}, // TODO
            LocationsData: {}, // TODO
            ProfileData: {}, // TODO
            StoryData: [], // TODO
            FilterData: [], // TODO
            StoreData: {}, // TODO
            IOIAccountStatus: {
                IsConfirmed: true,
                LinkedEmail: 'mail@example.com',
                IOIAccountId: '00000000-0000-0000-0000-000000000000',
                IOIAccountBaseUrl: 'https://account.ioi.dk',
            },
            FinishedFinalTest: true,
            Currency: { // 👀
                Balance: 0
            },
            PlayerProfileXpData: {
                XP: userdata.Extensions.progression.PlayerProfileXP.Total,
                Level: userdata.Extensions.progression.PlayerProfileXP.ProfileLevel,
                MaxLevel: MaxPlayerLevel,
            },
        },
    });
});

app.get('/SafehouseCategory', extractToken, async (req, res) => {
    const inventory = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`))).Extensions.inventory;
    let safehousedata = {
        template: null,
        data: {
            Category: '_root',
            SubCategories: [],
            IsLeaf: false,
            Data: null
        }
    };
    for (const item of inventory) {
        if (req.query.type) { // if type is specified in query
            if (item.Unlockable.Type != req.query.type) {
                continue; // skip all items that are not that type
            }
            if (req.query.subtype && item.Unlockable.Subtype != req.query.subtype) { // if subtype is specified
                continue; // skip all items that are not that subtype
            }
        } else if (item.Unlockable.Type == 'access' || item.Unlockable.Type == 'location' || item.Unlockable.Type == 'package'
            || item.Unlockable.Type == 'loadoutunlock' || item.Unlockable.Type == 'agencypickup' || item.Unlockable.Type == 'emote') {
            continue; // these types should not be displayed when not asked for
        }

        let category = safehousedata.data.SubCategories.find(cat => cat.Category == item.Unlockable.Type);
        let subcategory;
        if (!category) {
            category = {
                Category: item.Unlockable.Type,
                SubCategories: [],
                IsLeaf: false,
                Data: null,
            };
            safehousedata.data.SubCategories.push(category);
        }
        subcategory = category.SubCategories.find(cat => cat.Category == item.Unlockable.Subtype);
        if (!subcategory) {
            subcategory = {
                Category: item.Unlockable.Subtype,
                SubCategories: null,
                IsLeaf: true,
                Data: {
                    Type: item.Unlockable.Type,
                    SubType: item.Unlockable.Subtype,
                    Items: [],
                    Page: 0, // unused?
                    HasMore: false, // unused?
                },
            };
            category.SubCategories.push(subcategory);
        }

        subcategory.Data.Items.push({
            Item: item,
            ItemDetails: {
                Capabilities: [],
                StatList: item.Unlockable.Properties.Gameplay ? Object.entries(item.Unlockable.Properties.Gameplay).map(([key, value]) => ({
                    Name: key,
                    Ratio: value,
                })) : [],
                PropertyTexts: []
            },
            Type: item.Unlockable.Type,
            SubType: item.Unlockable.SubType,
        });
    }

    for (const [id, category] of safehousedata.data.SubCategories.entries()) {
        if (category.SubCategories.length == 1) { // if category only has one subcategory
            safehousedata.data.SubCategories[id] = category.SubCategories[0]; // flatten it
            safehousedata.data.SubCategories[id].Category = category.Category; // but keep the top category's name
        }
    }
    if (safehousedata.data.SubCategories.length == 1) { // if root has only one subcategory
        safehousedata.data = safehousedata.data.SubCategories[0]; // flatten it
    }

    res.json(safehousedata);
})

app.get('/stashpoint', extractToken, async (req, res) => {
    // /stashpoint?contractid=e5b6ccf4-1f29-4ec6-bfb8-2e9b78882c85&slotid=4&slotname=gear4&stashpoint=&allowlargeitems=true&allowcontainers=true
    // /stashpoint?contractid=c1d015b4-be08-4e44-808e-ada0f387656f&slotid=3&slotname=disguise3&stashpoint=&allowlargeitems=true&allowcontainers=true
    // /stashpoint?contractid=&slotid=3&slotname=disguise&stashpoint=&allowlargeitems=true&allowcontainers=false
    // /stashpoint?contractid=5b5f8aa4-ecb4-4a0a-9aff-98aa1de43dcc&slotid=6&slotname=stashpoint6&stashpoint=28b03709-d1f0-4388-b207-f03611eafb64&allowlargeitems=true&allowcontainers=false
    const userData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    let contractData;
    await readFile(path.join('contractdata', `${req.query.contractid}.json`)).then(contractfile => {
        contractData = req.query.contractid ? JSON.parse(contractfile) : null;
    }).catch(err => {
        if (err.code != 'ENOENT') {
            throw err; // rethrow if error is something else than a non-existant file
        }
        contractData = null;
    })

    if (req.query.slotname.endsWith(req.query.slotid.toString())) {
        req.query.slotname = req.query.slotname.slice(0, -req.query.slotid.toString().length); // weird
    }

    const stashData = {
        template: await getTemplate('stashpoint', req.gameVersion),
        data: {
            SlotId: req.query.slotid,
            LoadoutItemsData: {
                SlotId: req.query.slotid,
                Items: userData.Extensions.inventory.filter(item => {
                    return item.Unlockable.Properties.LoadoutSlot // only display items
                        && (!req.query.slotname
                            || ((/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(req.query.slotid) // container
                                || req.query.slotname == 'stashpoint') // stashpoint
                                && item.Unlockable.Properties.LoadoutSlot != 'disguise') // container or stashpoint => display all items
                            || item.Unlockable.Properties.LoadoutSlot == req.query.slotname) // else: display items for requested slot
                        && (req.query.allowcontainers == 'true' || !item.Unlockable.Properties.IsContainer)
                        && (req.query.allowlargeitems == 'true' || item.Unlockable.Properties.LoadoutSlot != 'carriedweapon'); // not sure about this one
                    // TODO: filter for specific stashpoints?
                }).map(item => ({
                    Item: item,
                    ItemDetails: {
                        Capabilities: [],
                        StatList: item.Unlockable.Properties.Gameplay ? Object.entries(item.Unlockable.Properties.Gameplay).map(([key, value]) => ({
                            Name: key,
                            Ratio: value,
                        })) : [],
                        PropertyTexts: [],
                    },
                    SlotId: req.query.slotid,
                    SlotName: null,
                })),
                Page: 0,
                HasMore: false,
                HasMoreLeft: false,
                HasMoreRight: false,
                OptionalData: {
                    stashpoint: req.query.stashpoint || '',
                    AllowLargeItems: req.query.allowlargeitems, //?? true (null coalescing when) (edit: not needed as it's always sent)
                    AllowContainers: req.query.allowcontainers, //?? true
                }
            },
            ShowSlotName: req.query.slotname,
        }
    }
    if (contractData) {
        stashData.data.UserCentric = await generateUserCentric(contractData, userData, req.gameVersion)
    }
    res.json(stashData);
});

app.get('/multiplayerpresets', extractToken, async (req, res) => { // /multiplayerpresets?gamemode=versus&disguiseUnlockableId=TOKEN_OUTFIT_HOT_SUMMER_SUIT
    if (req.query.gamemode != 'versus') { // not sure what happens here
        next();
    }
    let multiplayerPresets = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'MultiplayerPresets.json')));

    multiplayerPresets.data.LoadoutData = await getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId, req.gameVersion);
    // TODO: completion data for locations
    res.json(multiplayerPresets); // presets + user data for locations + contract details + loadout
});

async function getLoadoutData(userId, disguiseUnlockableId, gameVersion) {
    const allunlockables = JSON.parse(await readFile(path.join('userdata', gameVersion, 'allunlockables.json')));
    const userInventory = JSON.parse(await readFile(path.join('userdata', gameVersion, 'users', `${userId}.json`))).Extensions.inventory;
    let unlockable = allunlockables.find(unlockable => unlockable.Id == disguiseUnlockableId);
    if (!unlockable) {
        unlockable = allunlockables.find(unlockable => unlockable.Id == 'TOKEN_OUTFIT_HITMANSUIT');
    }
    unlockable.GameAsset = null;
    unlockable.DisplayNameLocKey = `UI_${unlockable.Id}_NAME`;
    return Array.of({
        SlotName: 'disguise',
        SlotId: '3',
        Recommended: {
            item: {
                InstanceId: uuid.v4(),
                ProfileId: uuid.NIL,
                Unlockable: unlockable,
                Properties: {},
            },
            type: 'disguise',
            owned: userInventory.some(item => item.Unlockable.Id == disguiseUnlockableId),
        },
    });
}

app.get('/multiplayer', extractToken, async (req, res) => { // /multiplayer?gamemode=versus&disguiseUnlockableId=TOKEN_OUTFIT_ELUSIVE_COMPLETE_15_SUIT
    if (req.query.gamemode != 'versus') { // not sure what happens here
        return
    }
    res.json({
        template: null,
        data: {
            LoadoutData: await getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId, req.gameVersion),
        }
    });
});

app.get('/Planning', extractToken, async (req, res) => {
    const userData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    const repo = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'allunlockables.json')));
    const entranceData = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'Entrances.json')));
    readFile(path.join('contractdata', `${req.query.contractid}.json`)).then(async contractfile => {
        const contractData = JSON.parse(contractfile);
        const creatorProfile = (await resolveProfiles([contractData.Metadata.CreatorUserId], req.gameVersion))[0]
            || (await resolveProfiles(['fadb923c-e6bb-4283-a537-eb4d1150262e'], req.gameVersion))[0]; // use IOI profile if profile not found
        const sublocation = repo.find(entry => entry.Id == contractData.Metadata.Location);
        let entrancesInScene = entranceData[contractData.Metadata.ScenePath.toLowerCase()];
        if (!entrancesInScene) {
            entrancesInScene = [];
            console.error(`Could not find entrance data for '${contractData.Metadata.ScenePath.toLowerCase()}'`);
        }
        const unlockedEntrances = userData.Extensions.inventory.filter(item => item.Unlockable.Type == 'access')
            .map(i => i.Unlockable)
            .filter(unlockable => unlockable.Properties.RepositoryId);
        sublocation.DisplayNameLocKey = `UI_${sublocation.Id}_NAME`;
        res.json({
            template: await getTemplate('planning', req.gameVersion),
            data: {
                Contract: contractData,
                ElusiveContractState: 'not_completed', // TODO? ['completed', 'not_completed', 'time_ran_out', 'failed'], empty string for non elusives
                UserCentric: await generateUserCentric(contractData, userData, req.gameVersion, repo),
                IsFirstInGroup: true, // escalation related?
                Creator: creatorProfile,
                UserContract: creatorProfile.DevId != 'IOI',
                UnlockedEntrances: userData.Extensions.inventory.filter(item => item.Unlockable.Type == 'access')
                    .map(i => i.Unlockable.Properties.RepositoryId)
                    .filter(id => id),
                UnlockedAgencyPickups: userData.Extensions.inventory.filter(item => item.Unlockable.Type == 'agencypickup')
                    .map(i => i.Unlockable.Properties.RepositoryId)
                    .filter(id => id),
                Objectives: await mapObjectives(contractData.Data.Objectives, contractData.Data.GameChangers, contractData.Metadata.GroupObjectiveDisplayOrder),
                GroupData: {},
                Entrances: unlockedEntrances.filter(unlockable => entrancesInScene.includes(unlockable.Properties.RepositoryId))
                    .sort((a, b) => a.Properties.UnlockOrder - b.Properties.UnlockOrder),
                Location: sublocation,
                LoadoutData: [
                    {
                        SlotName: 'carriedweapon',
                        SlotId: '0',
                        Recommended: null,
                    },
                    {
                        SlotName: 'carrieditem',
                        SlotId: '1',
                        Recommended: null,
                    },
                    {
                        SlotName: 'concealedweapon',
                        SlotId: '2',
                        Recommended: {
                            item: userData.Extensions.inventory.find(item => item.Unlockable.Id == 'FIREARMS_HERO_PISTOL_TACTICAL_ICA_19'),
                            type: 'concealedweapon',
                        },
                    },
                    {
                        SlotName: 'disguise',
                        SlotId: '3',
                        Recommended: {
                            item: userData.Extensions.inventory.find(item => item.Unlockable.Id == 'TOKEN_OUTFIT_HITMANSUIT'),
                            type: 'disguise',
                        },
                    },
                    {
                        SlotName: 'gear',
                        SlotId: '4',
                        Recommended: {
                            item: userData.Extensions.inventory.find(item => item.Unlockable.Id == 'TOKEN_FIBERWIRE'),
                            type: 'gear',
                        },
                    },
                    {
                        SlotName: 'gear',
                        SlotId: '5',
                        Recommended: {
                            item: userData.Extensions.inventory.find(item => item.Unlockable.Id == 'PROP_TOOL_COIN'),
                            type: 'gear',
                        },
                    },
                    {
                        SlotName: 'stashpoint',
                        SlotId: '6',
                        Recommended: null,
                    },
                ], // TODO
                LimitedLoadoutUnlockLevel: 0, // ?
                CharacterLoadoutData: null,
                ChallengeData: {
                    Children: [], // TODO
                },
                Currency: {
                    Balance: 0,
                },
                PaymentDetails: { // ?
                    Currency: 'Merces',
                    Amount: 0,
                    MaximumDeduction: 85,
                    Bonuses: null,
                    Expenses: null,
                    Entrance: null,
                    Pickup: null,
                    SideMission: null
                },
                OpportunityData: [], // TODO
                PlayerProfileXpData: {
                    XP: userData.Extensions.progression.PlayerProfileXP.Total,
                    Level: userData.Extensions.progression.PlayerProfileXP.ProfileLevel,
                    MaxLevel: MaxPlayerLevel,
                },
            },
        });
    }).catch(err => {
        if (err.code == 'ENOENT') {
            console.error(`Requested /Planning for unknown contract: ${path.basename(err.path, '.json')}`);
            res.status(404).end();
        } else {
            console.error(err);
            res.status(500).end();
        }
    });
});

app.get('/leaderboardsview', extractToken, async (req, res) => {
    res.json({
        template: await getTemplate('leaderboardsview', req.gameVersion),
        data: {
            LeaderboardUrl: 'leaderboardentries',
            LeaderboardType: ''
        }
    });
});

app.get('/selectagencypickup', extractToken, async (req, res) => {
    const userData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    const pickupData = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'AgencyPickups.json')));
    readFile(path.join('contractdata', `${req.query.contractId}.json`)).then(async contractfile => {
        const contractData = JSON.parse(contractfile);
        let pickupsInScene = pickupData[contractData.Metadata.ScenePath.toLowerCase()];
        if (!pickupsInScene) {
            pickupsInScene = [];
            console.error(`Could not find pickup data for '${contractData.Metadata.ScenePath.toLowerCase()}'`);
        }
        const unlockedAgencyPickups = userData.Extensions.inventory.filter(item => item.Unlockable.Type == 'agencypickup')
            .map(i => i.Unlockable)
            .filter(unlockable => unlockable.Properties.RepositoryId);

        const selectagencypickup = {
            template: await getTemplate('selectagencypickup', req.gameVersion),
            data: {
                Unlocked: unlockedAgencyPickups.map(unlockable => unlockable.Properties.RepositoryId),
                Contract: contractData,
                OrderedUnlocks: unlockedAgencyPickups.filter(unlockable => pickupsInScene.includes(unlockable.Properties.RepositoryId))
                    .sort((a, b) => a.Properties.UnlockOrder - b.Properties.UnlockOrder),
                UserCentric: await generateUserCentric(contractData, userData, req.gameVersion),
            }
        };
        res.json(selectagencypickup);
    }).catch(err => {
        if (err.code == 'ENOENT') {
            console.error(`Requested /selectagencypickup for unknown contract: ${path.basename(err.path, '.json')}`);
            res.status(404).end();
        } else {
            console.error(err);
            res.status(500).end();
        }
    });
});


app.get('/selectentrance', extractToken, async (req, res) => {
    const userData = JSON.parse(await readFile(path.join('userdata', req.gameVersion, 'users', `${req.jwt.unique_name}.json`)));
    const entranceData = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'Entrances.json')));
    readFile(path.join('contractdata', `${req.query.contractId}.json`)).then(async contractfile => {
        const contractData = JSON.parse(contractfile);
        const entrancesInScene = entranceData[contractData.Metadata.ScenePath.toLowerCase()];
        const unlockedEntrances = userData.Extensions.inventory.filter(item => item.Unlockable.Type == 'access')
            .map(i => i.Unlockable)
            .filter(unlockable => unlockable.Properties.RepositoryId);

        const selectentrance = {
            template: await getTemplate('selectentrance', req.gameVersion),
            data: {
                Unlocked: unlockedEntrances.map(unlockable => unlockable.Properties.RepositoryId),
                Contract: contractData,
                OrderedUnlocks: unlockedEntrances.filter(unlockable => entrancesInScene.includes(unlockable.Properties.RepositoryId))
                    .sort((a, b) => a.Properties.UnlockOrder - b.Properties.UnlockOrder),
                UserCentric: await generateUserCentric(contractData, userData, req.gameVersion),
            }
        };
        res.json(selectentrance);
    }).catch(err => {
        if (err.code == 'ENOENT') {
            console.error(`Requested /selectentrance for unknown contract: ${path.basename(err.path, '.json')}`);
            res.status(404).end();
        } else {
            console.error(err);
            res.status(500).end();
        }
    });
});

app.get('/missionendready', async (req, res) => {
    const missionendready = {
        template: await getTemplate('missionendready', req.gameVersion),
        data: {
            contractSessionId: req.query.contractSessionId,
            missionEndReady: true,
            retryCount: 1,
        }
    };
    res.json(missionendready);
});

app.post('/multiplayermatchstatsready', (req, res) => {
    // TODO: keep track of match stats return em with /multiplayermatchstats
    res.json({
        template: null,
        data: {
            contractSessionId: req.query.contractSessionId,
            isReady: true,
            retryCount: 1,
        },
    });
});

app.post('/multiplayermatchstats', (req, res) => {
    const sessionDetails = contractSessions.get(req.query.contractSessionId);
    if (!sessionDetails) { // contract session not found
        res.status(404).end();
        return;
    }
    const scores = [calculateMpScore(sessionDetails)];
    for (const opponentId in sessionDetails.ghost.Opponents) {
        const opponentSessionDetails = contractSessions.get(sessionDetails.ghost.Opponents[opponentId]);
        if (opponentSessionDetails) {
            scores.push(calculateMpScore(opponentSessionDetails));
        } else { // opponent contract session not found
            scores.push({});
        }
    }
    res.json({
        template: null,
        data: {
            Players: scores,
        },
    });
});

app.get('/missionend', extractToken, scoreHandler.missionend);

async function mapObjectives(Objectives, GameChangers, GroupObjectiveDisplayOrder) {
    const result = new Map();
    let gameChangerObjectives = [];

    if (GameChangers && GameChangers.length > 0) {
        const gameChangerData = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'GameChangerProperties.json')));
        for (const gamechangerId of GameChangers) {
            const gameChangerProps = gameChangerData[gamechangerId];
            if (gameChangerProps) {
                if (gameChangerProps.IsHidden) {
                    if (gameChangerProps.Objectives.length == 1) { // Either 0 or 1 I think.
                        const objective = gameChangerProps.Objectives[0];
                        objective.Id = gamechangerId;
                        gameChangerObjectives.push(objective);
                    }
                } else {
                    result.set(gamechangerId, {
                        Type: 'gamechanger',
                        Properties: {
                            Id: gamechangerId,
                            Name: gameChangerProps.Name,
                            Description: gameChangerProps.Description,
                            LongDescription: gameChangerProps.LongDescription == null ?
                                gameChangerProps.Description : gameChangerProps.LongDescription,
                            TileImage: gameChangerProps.TileImage,
                            Icon: gameChangerProps.Icon,
                            ObjectivesCategory: gameChangerProps.ObjectivesCategory,
                        },
                    });
                }
            }
        }
    }

    for (const objective of (Objectives || []).concat(gameChangerObjectives)) {
        if (!objective.Category) {
            objective.Category = objective.Primary ? 'primary' : 'secondary';
        }
        if (objective.ForceShowOnLoadingScreen === false || objective.Activation
            || (objective.OnActive && objective.OnActive.IfInProgress && objective.OnActive.IfInProgress.Visible === false)
            || (objective.OnActive && objective.OnActive.IfCompleted && objective.OnActive.IfCompleted.Visible === false
                && objective.Definition && objective.Definition.States && objective.Definition.States.Start
                && objective.Definition.States.Start['-'] && objective.Definition.States.Start['-'].Transition == 'Success')
        ) {
            continue; // do not show objectives with 'ForceShowOnLoadingScreen: false' or objectives that are not visible on start
        }

        if (objective.SuccessEvent && objective.SuccessEvent.EventName == 'Kill'
            && objective.SuccessEvent.EventValues
            && objective.SuccessEvent.EventValues.RepositoryId) {
            result.set(objective.Id, {
                Type: 'kill',
                Properties: {
                    Id: objective.SuccessEvent.EventValues.RepositoryId,
                    Conditions: [], // TODO?
                },
            });
            continue;
        } else if ((!objective.ObjectiveType || objective.ObjectiveType == 'kill') && objective.Type == 'statemachine' && objective.Definition.States
            && objective.Definition.States.Start && objective.Definition.States.Start.Kill) { // This objective can possibly be displayed as a simple kill objective

            let simpleKill = true;
            let conditionsRequired = false;
            let failsWithoutConditions = false;
            let targetIds = new Set();
            let Conditions = objective.TargetConditions ? objective.TargetConditions.map(condition => ({
                Type: condition.Type,
                RepositoryId: condition.RepositoryId || uuid.NIL,
                HardCondition: condition.HardCondition || false,
                ObjectiveId: condition.ObjectiveId || uuid.NIL,
                KillMethod: condition.KillMethod || '',
            })) : [];

            for (const event in objective.Definition.States.Start) {
                const eventActions = Array.isArray(objective.Definition.States.Start[event]) ?
                    objective.Definition.States.Start[event] : [objective.Definition.States.Start[event]]; // can be array or object -> make array if object
                if (event == 'Kill' || event == 'Pacify') {
                    for (const eventAction of eventActions) {
                        if (eventAction.Transition == 'Success') {

                            const simplekillcheck = function simplekillcheck(condition, localTargetIds) {
                                let localConditionsRequired = false;
                                if (condition.$and) {
                                    localConditionsRequired = condition.$and.some(subCondition => simplekillcheck(subCondition, localTargetIds)[1]);
                                } else if (condition.$or) {
                                    localConditionsRequired = condition.$or.every(subCondition => simplekillcheck(subCondition, localTargetIds)[1]);
                                } else if (condition.$eq) {
                                    const repoStrIndex = condition.$eq.indexOf('$Value.RepositoryId');
                                    if (repoStrIndex != -1) { // killed target id is checked
                                        let localtargetId = condition.$eq[1 - repoStrIndex];
                                        if (localtargetId.startsWith('$')) {
                                            simpleKill = false; // TODO? (I hope not): get target id from dynamic variables
                                        }
                                        localTargetIds.add(localtargetId);
                                    } else if (condition.$eq.includes('$Value.KillItemCategory') // kill item category is checked
                                        || condition.$eq.includes('$Value.KillItemRepositoryId') // kill item id is checked
                                        || condition.$eq.includes('$Value.KillClass') // kill class is checked
                                        || condition.$eq.includes('$Value.KillMethodBroad') // broad kill method is checked
                                        || condition.$eq.includes('$Value.KillMethodStrict') // strict kill method is checked
                                        || condition.$eq.includes('$Value.OutfitRepositoryId') // disguise id is checked
                                        || condition.$eq.includes('$Value.SetPieceType') // setpiecetype checked (e.g. drowning in toilet)
                                        || (condition.$eq.includes('$Value.OutfitIsHitmanSuit') && condition.$eq.includes(true)) // suit enforced
                                        || (condition.$eq.includes('$Value.Accident') && condition.$eq.includes(true))) { // accident enforced
                                        localConditionsRequired = true;
                                    }
                                } else if (condition.$any && (condition.$any.in == '$Value.DamageEvents' // damage events are probed
                                    || (condition.$any['?'].$eq
                                        && condition.$any['?'].$eq.includes('$Value.KillItemRepositoryId') // kill item is checked against a list
                                        && condition.$any['?'].$eq.includes('$.#'))
                                    || (condition.$any.in.length == 2
                                        && condition.$any.in.includes('$Value.KillMethodBroad') // either broad/strict kill method is checked
                                        && condition.$any.in.includes('$Value.KillMethodStrict')
                                    ))) {
                                    localConditionsRequired = true;
                                } else if (condition.$inarray && condition.$inarray.in == '$.Targets'
                                    && condition.$inarray['?'] && condition.$inarray['?'].$eq
                                    && condition.$inarray['?'].$eq.includes('$Value.RepositoryId')
                                    && condition.$inarray['?'].$eq.includes('$.#')
                                    && objective.Definition.Context && objective.Definition.Context.Targets) {
                                    // WHY, IOI, WHY
                                    for (const targetId of objective.Definition.Context.Targets) {
                                        localTargetIds.add(targetId);
                                    }
                                }
                                return [localTargetIds, localConditionsRequired];
                            };

                            let newTargetIds;
                            [newTargetIds, conditionsRequired] = simplekillcheck(eventAction.Condition, new Set());
                            for (const targetId of newTargetIds) {
                                targetIds.add(targetId);
                            }
                        } else if (eventAction.Transition == 'Failure' && objective.TargetConditions) {
                            let condition = eventAction.Condition;
                            let notindex = -1;
                            if (eventAction.Condition.$and) {
                                if (eventAction.Condition.$and.length == 1) { // single value in $and block
                                    condition = eventAction.Condition.$and[0];
                                } else if (eventAction.Condition.$and.length == 2 // two values
                                    && (notindex = eventAction.Condition.$and.findIndex(x => x.$not)) != -1) { // one is a $not
                                    condition = eventAction.Condition.$and[1 - notindex]; // use the other one
                                }
                            }
                            if (condition.$eq) {
                                const index = condition.$eq.indexOf('$Value.RepositoryId');
                                if (index != -1) {
                                    let targetId = condition.$eq[1 - index];
                                    targetIds.add(targetId);
                                    if (targetId.startsWith('$')) {
                                        simpleKill = false; // TODO?: get target id from dynamic variables
                                        break;
                                    } else {
                                        // Objective fails if regular kill
                                        failsWithoutConditions = true;
                                    }
                                } else {
                                    // Kill event leads to fail without checking target id
                                    simpleKill = false;
                                    break;
                                }
                            } else if (condition.$inarray && condition.$inarray.in == '$.Targets'
                                && condition.$inarray['?'] && condition.$inarray['?'].$eq
                                && condition.$inarray['?'].$eq.includes('$Value.RepositoryId')
                                && condition.$inarray['?'].$eq.includes('$.#')
                                && objective.Definition.Context && objective.Definition.Context.Targets) {
                                // yep.
                                for (const targetId of objective.Definition.Context.Targets) {
                                    targetIds.add(targetId);
                                }
                                failsWithoutConditions = true;
                            }
                        }
                    }
                }
            }

            if (simpleKill && targetIds.size == 1 && (!conditionsRequired || Conditions.length > 0)
                && ((conditionsRequired || Conditions.some(x => x.HardCondition)) == failsWithoutConditions)) {
                result.set(objective.Id, { // Custom objective is actually a simple kill objective
                    Type: 'kill',
                    Properties: {
                        Id: targetIds.values().next().value, // get first element
                        Conditions: Conditions,
                    }
                });
                continue;
            }
            // else: This is no simple kill objective: fall through to next block
        }
        if (objective.HUDTemplate && objective.ObjectiveType) {
            let id = null;
            if (objective.Definition && objective.Definition.Context && objective.Definition.Context.Targets
                && objective.Definition.Context.Targets.length == 1) {
                id = objective.Definition.Context.Targets[0];
            }

            const properties = {
                Id: id,
                BriefingText: objective.BriefingText || '',
                LongBriefingText: objective.LongBriefingText == null ?
                    (objective.BriefingText || '') : objective.LongBriefingText,
                Image: objective.Image,
                BriefingName: objective.BriefingName,
                DisplayAsKill: objective.DisplayAsKillObjective || false,
                ObjectivesCategory: objective.Category,
                ForceShowOnLoadingScreen: objective.ForceShowOnLoadingScreen || false,
            };
            switch (objective.ObjectiveType) {
                case 'customkill':
                    delete properties.Image;
                    delete properties.ForceShowOnLoadingScreen;
                    delete properties.BriefingName;
                case 'setpiece':
                    delete properties.ObjectivesCategory;
                    break;
                default:
                    delete properties.Id; // only add Id for customkill and setpiece
            }

            result.set(objective.Id, {
                Type: objective.ObjectiveType,
                Properties: properties,
            });
        }
        // objective not shown on planning screen
    }

    const sortedResult = [];
    const resultIds = new Set();
    for (const { Id, IsNew } of GroupObjectiveDisplayOrder || []) {
        if (!resultIds.has(Id)) { // if not yet added
            const objective = result.get(Id);
            if (objective) {
                if (IsNew) {
                    objective.Properties.IsNew = true;
                }
                sortedResult.push(objective);
                resultIds.add(Id);
            }
        }
    }

    // add each objective or gamechanger that is not already in the result
    for (const { Id, ExcludeFromScoring, ForceShowOnLoadingScreen } of (Objectives || []).concat((GameChangers || []).map(x => ({ Id: x })))) {
        if (!resultIds.has(Id)) {
            let resultobjective = result.get(Id);
            if (resultobjective && (!ExcludeFromScoring || ForceShowOnLoadingScreen)) {
                sortedResult.push(resultobjective);
                resultIds.add(Id);
            }
        }
    }

    return sortedResult;
}

async function generateUserCentric(contractData, userData, gameVersion, repoData) {
    const repo = repoData || JSON.parse(await readFile(path.join('userdata', gameVersion, 'allunlockables.json')));
    const sublocation = repo.find(entry => entry.Id == contractData.Metadata.Location);
    sublocation.DisplayNameLocKey = `UI_${sublocation.Id}_NAME`;
    const maxlevel = maxLevelForLocation(sublocation.Properties.ProgressionKey, gameVersion);
    const locationProgression = userData.Extensions.progression.Locations[sublocation.Properties.ProgressionKey.toLowerCase()];
    return {
        Contract: contractData,
        Data: {
            IsLocked: sublocation.Properties.IsLocked || false,
            LockedReason: '',
            LocationLevel: locationProgression.Level,
            LocationMaxLevel: maxlevel,
            LocationCompletion: (locationProgression.Level == maxlevel) ? 1 :
                (locationProgression.Xp - xpRequiredForLevel(locationProgression.Level)) /
                (xpRequiredForLevel(locationProgression.Level + 1) - xpRequiredForLevel(locationProgression.Level)),
            LocationXpLeft: (locationProgression.Level == maxlevel) ? 0 : xpRequiredForLevel(locationProgression.Level + 1) - locationProgression.Xp,
            LocationHideProgression: false, // ?
            ElusiveContractState: '', // ?
            IsFeatured: false,
            //LastPlayedAt: '2020-01-01T00:00:00.0000000Z', // ISO timestamp
            Completed: false, // relevant for featured contracts
            LocationId: sublocation.Id,
            ParentLocationId: sublocation.Properties.ParentLocation,
            CompletionData: {
                Level: locationProgression.Level,
                MaxLevel: maxlevel,
                XP: locationProgression.Xp,
                Completion: (locationProgression.Level == maxlevel) ? 1 :
                    (locationProgression.Xp - xpRequiredForLevel(locationProgression.Level)) /
                    (xpRequiredForLevel(locationProgression.Level + 1) - xpRequiredForLevel(locationProgression.Level)),
                XpLeft: (locationProgression.Level == maxlevel) ? 0 : xpRequiredForLevel(locationProgression.Level + 1) - locationProgression.Xp,
                Id: sublocation.Properties.ParentLocation,
                SubLocationId: sublocation.Id,
                HideProgression: false,
                IsLocationProgression: true,
                Name: null,
            },
            DlcName: sublocation.Properties.DlcName,
            DlcImage: sublocation.Properties.DlcImage
        }
    };
}

function calculateMpScore(sessionDetails) {
    return {
        Header: {
            GameMode: "Ghost",
            Result: sessionDetails.ghost.IsWinner ? 'Win' : 'Loss', // TODO: opponent left?
        },
        Metadata: {},
        Data: {
            Score: sessionDetails.ghost.Score,
            OpponentScore: sessionDetails.ghost.OpponentScore,
            PacifiedNpcs: [...sessionDetails.pacifications].filter(id => !sessionDetails.npcKills.has(id) && !sessionDetails.targetKills.has(id)).length,
            DisguisesUsed: sessionDetails.disguisesUsed.size,
            DisguisesRuined: sessionDetails.disguisesRuined.size, // custom
            BodiesHidden: sessionDetails.bodiesHidden.size,
            UnnoticedKills: sessionDetails.ghost.unnoticedKills,
            KilledNpcs: sessionDetails.npcKills.size + sessionDetails.crowdNpcKills,
            Deaths: sessionDetails.ghost.deaths,
            Duration: sessionDetails.duration,
        }
    }
}

module.exports = app;
