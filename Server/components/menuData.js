// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const uuid = require('uuid');
const { readFile } = require('atomically');

const { extractToken, MaxPlayerLevel, xpRequiredForLevel, maxLevelForLocation } = require('./utils.js');
const { resolveProfiles } = require('./profileHandler.js');

const app = express.Router();

// /profiles/page/

app.get('/dashboard/Dashboard_Category_Escalation/10000000-0000-0000-0000-000000000000/ContractList/25739126-6a40-4b0b-b9a6-5da1b737190b/dataonly', extractToken, async (req, res) => {
    const userData = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    const repoData = JSON.parse(await readFile(path.join('userdata', 'allunlockables.json')));
    let contractIds = [];
    await readFile(path.join('menudata', 'featuredContracts.json')).then(file => {
        contractIds = JSON.parse(file);
    }).catch(err => {
        if (err.code != 'ENOENT') {
            console.error(err);
        } // use empty array if no featuredContracts.json exists
    });
    const contracts = (await Promise.allSettled(contractIds.map(id => {
        return readFile(path.join('contractdata', `${id}.json`)).then(file => {
            return generateUserCentric(JSON.parse(file), userData, repoData);
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

    res.json({
        template: null,
        data: {
            Item: {
                Id: '25739126-6a40-4b0b-b9a6-5da1b737190b',
                Type: 'ContractList',
                Title: 'ContractList',
                Date: '2020-01-01T00:00:00.0000000Z',
                Data: contracts.length > 0 ? contracts : null,
            },
        },
    })
});

app.get('/Hub', extractToken, async (req, res) => {
    const userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    const serverTile = await readFile(path.join('menudata', 'serverTile.json')).then(file => {
        return JSON.parse(file);
    }).catch(async err => {
        if (err.code != 'ENOENT') {
            throw err;
        }
        return JSON.parse(await readFile(path.join('menudata', 'serverTile.template.json'))); // use template if no custom serverTile.json exists
    });
    res.json({
        template: null,
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
    const inventory = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`))).Extensions.inventory;
    let safehousedata = {
        template: null,
        data: {
            Category: '_root',
            SubCategories: [],
            IsLeaf: false,
            Data: null
        }
    };
    inventory.forEach(item => {
        if (item.Unlockable.Type == 'access' || item.Unlockable.Type == 'location' || item.Unlockable.Type == 'package'
            || item.Unlockable.Type == 'loadoutunlock' || item.Unlockable.Type == 'agencypickup'
            || req.query.type && item.Unlockable.Type != req.query.type
            || req.query.subtype && item.Unlockable.Subtype != req.query.Subtype) {
            return;
        }

        let category = safehousedata.data.SubCategories.find(cat => cat.Category == item.Unlockable.Type);
        let subcategory;
        if (!category) {
            category = {
                Category: item.Unlockable.Type,
                SubCategories: [],
            };
            if (item.Unlockable.Type == item.Unlockable.Subtype) {
                category.IsLeaf = true;
                category.Data = {
                    Type: item.Unlockable.Type,
                    SubType: item.Unlockable.Subtype,
                    Items: [],
                    Page: 0,
                    HasMore: false,
                };
            } else {
                category.IsLeaf = false;
                category.Data = null;
            }
            safehousedata.data.SubCategories.push(category);
        }
        if (item.Unlockable.Type == item.Unlockable.Subtype) {
            subcategory = category;
        } else {
            subcategory = category.SubCategories.find(cat => cat.Category == item.Unlockable.Subtype);
            if (!subcategory) {
                subcategory = {
                    Category: item.Unlockable.Subtype,
                    SubCategories: [],
                    IsLeaf: true,
                    Data: {
                        Type: item.Unlockable.Type,
                        SubType: item.Unlockable.Subtype,
                        Items: [],
                    },
                };
                category.SubCategories.push(subcategory);
            }
        }

        subcategory.Data.Items.push({
            Item: item,
            ItemDetails: {
                Capabilities: [],
                StatList: [],
                PropertyTexts: []
            },
            Type: item.Unlockable.Type,
            SubType: item.Unlockable.SubType,
        });
    })
    res.json(safehousedata);
})

app.get('/stashpoint', extractToken, async (req, res) => {
    // /stashpoint?contractid=e5b6ccf4-1f29-4ec6-bfb8-2e9b78882c85&slotid=4&slotname=gear4&stashpoint=&allowlargeitems=true&allowcontainers=true
    // /stashpoint?contractid=c1d015b4-be08-4e44-808e-ada0f387656f&slotid=3&slotname=disguise3&stashpoint=&allowlargeitems=true&allowcontainers=true
    // /stashpoint?contractid=&slotid=3&slotname=disguise&stashpoint=&allowlargeitems=true&allowcontainers=false
    // /stashpoint?contractid=5b5f8aa4-ecb4-4a0a-9aff-98aa1de43dcc&slotid=6&slotname=stashpoint6&stashpoint=28b03709-d1f0-4388-b207-f03611eafb64&allowlargeitems=true&allowcontainers=false
    const stashdata = JSON.parse(await readFile(path.join('menudata', 'menudata', 'stashpoint.json'))); // template only
    const userdata = JSON.parse(await readFile(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    let contractdata;
    await readFile(path.join('contractdata', `${req.query.contractid}.json`)).then(contractfile => {
        contractdata = req.query.contractid ? JSON.parse(contractfile).Contract : null;
    }).catch(err => {
        if (err.code != 'ENOENT') {
            throw err; // rethrow if error is something else than a non-existant file
        }
        contractdata = null;
    })

    if (req.query.slotname.endsWith(req.query.slotid.toString())) {
        req.query.slotname = req.query.slotname.slice(0, -req.query.slotid.toString().length); // weird
    }

    stashdata.data = {
        SlotId: req.query.slotid,
        LoadoutItemsData: {
            SlotId: req.query.slotid,
            Items: userdata.Extensions.inventory.filter(item => {
                return (!req.query.slotname || req.query.slotname.startsWith('stashpoint') || item.Unlockable.Properties.LoadoutSlot == req.query.slotname)
                    && (req.query.allowcontainers || !item.Unlockable.Properties.IsContainer)
                    && (req.query.allowlargeitems || item.Unlockable.Properties.LoadoutSlot != 'carriedweapon'); // not sure about this one
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
    if (contractdata) {
        stashdata.data.UserCentric = generateUserCentric(contractData, userData)
    }
    res.json(stashdata);
});

app.get('/multiplayerpresets', extractToken, async (req, res) => { // /multiplayerpresets?gamemode=versus&disguiseUnlockableId=TOKEN_OUTFIT_HOT_SUMMER_SUIT
    if (req.query.gamemode != 'versus') { // not sure what happens here
        next();
    }
    let multiplayerPresets = JSON.parse(await readFile(path.join('menudata', 'menudata', 'multiplayerpresets.json')));

    multiplayerPresets.data.LoadoutData = await getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId);
    // TODO: completion data for locations
    res.json(multiplayerPresets); // presets + user data for locations + contract details + loadout
})

async function getLoadoutData(userId, disguiseUnlockableId) {
    const allunlockables = JSON.parse(await readFile(path.join('userdata', 'allunlockables.json')));
    const userInventory = JSON.parse(await readFile(path.join('userdata', 'users', `${userId}.json`))).Extensions.inventory;
    let unlockable = allunlockables.find(unlockable => unlockable.Id == disguiseUnlockableId);
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
            LoadoutData: await getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId),
        }
    });
});

app.get('/missionendready', async (req, res) => {
    let missionendready = JSON.parse(await readFile(path.join('menudata', 'menudata', 'missionendready.json'))); // template
    missionendready.data = {
        contractSessionId: req.query.contractSessionId,
        missionEndReady: true,
        retryCount: 1,
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

async function generateUserCentric(contractData, userData, repoData) {
    const repo = repoData || JSON.parse(await readFile(path.join('userdata', 'allunlockables.json')));
    const sublocation = repo.find(entry => entry.Id == contractData.Metadata.Location);
    sublocation.DisplayNameLocKey = `UI_${sublocation.Id}_NAME`;
    const maxlevel = maxLevelForLocation(sublocation.Properties.ProgressionKey);
    const locationProgression = userData.Extensions.progression.Locations[sublocation.Properties.ProgressionKey.toLowerCase()];
    return {
        Contract: contractData,
        Data: {
            IsLocked: sublocation.Properties.IsLocked,
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
            LastPlayedAt: '2020-01-01T00:00:00.0000000Z', // ISO timestamp
            LocationId: sublocation.Id,
            ParentLocationId: sublocation.Properties.ParentLocation,
            CompletionData: {
                Level: locationProgression.Level,
                MaxLevel: maxLevelForLocation(sublocation.Properties.ProgressionKey),
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

module.exports = app;
