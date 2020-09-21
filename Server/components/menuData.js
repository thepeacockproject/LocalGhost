// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

const { extractToken } = require('./utils.js');

const app = express.Router();

// /profiles/page/

app.get('/Hub', extractToken, (req, res) => {
    // TODO: send some actual data (not needed for current menu layout)
    const userdata = JSON.parse(fs.readFileSync(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    res.json({
        template: null,
        data: {
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
                MaxLevel: 5000,
            },
        },
    });
});

app.get('/SafehouseCategory', extractToken, (req, res) => {
    const inventory = JSON.parse(fs.readFileSync(path.join('userdata', 'users', `${req.jwt.unique_name}.json`))).Extensions.inventory;
    inventory.push(...JSON.parse(fs.readFileSync(path.join('menudata', 'menudata', 'emotes.json'))));
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

app.get('/stashpoint', extractToken, (req, res) => {
    // /stashpoint?contractid=e5b6ccf4-1f29-4ec6-bfb8-2e9b78882c85&slotid=4&slotname=gear4&stashpoint=&allowlargeitems=true&allowcontainers=true
    // /stashpoint?contractid=&slotid=3&slotname=disguise&stashpoint=&allowlargeitems=true&allowcontainers=false
    const stashdata = JSON.parse(fs.readFileSync(path.join('menudata', 'menudata', 'stashpoint.json'))); // template only
    const userdata = JSON.parse(fs.readFileSync(path.join('userdata', 'users', `${req.jwt.unique_name}.json`)));
    const contractdata = req.query.contractid ? JSON.parse(fs.readFileSync(path.join('contractdata', `${req.query.contractid}.json`))).Contract : {};
    stashdata.data = {
        SlotId: req.query.slotid,
        LoadoutItemsData: {
            SlotId: req.query.slotid,
            Items: userdata.Extensions.inventory.filter(item => {
                return !req.query.slotname || item.Unlockable.Properties.LoadoutSlot == req.query.slotname; // TODO: gear4?
                // TODO: filter for query.allowlargeitems & query.allowcontainers (is this needed?)
                // TODO: filter for specific stashpoints?
            }).map(item => ({
                Item: item,
                ItemDetails: {
                    Capabilities: [],
                    StatList: [],
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
                AllowLargeItems: req.query.allowlargeitems, //?? true (null coalescing when)
                AllowContainers: req.query.allowcontainers, //?? true
            }
        },
        ShowSlotName: req.query.slotname,
        UserCentric: {
            Contract: contractdata,
            Data: {}, // TODO: Location data
        },
    }
    res.json(stashdata);
});

app.get('/multiplayerpresets', extractToken, (req, res) => { // /multiplayerpresets?gamemode=versus&disguiseUnlockableId=TOKEN_OUTFIT_HOT_SUMMER_SUIT
    if (req.query.gamemode != 'versus') { // not sure what happens here
        next();
    }
    let multiplayerPresets = JSON.parse(fs.readFileSync(path.join('menudata', 'menudata', 'multiplayerpresets.json')));

    multiplayerPresets.data.LoadoutData = getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId);
    // TODO: completion data for locations
    res.json(multiplayerPresets); // presets + user data for locations + contract details + loadout
})

function getLoadoutData(userId, disguiseUnlockableId) {
    const allunlockables = JSON.parse(fs.readFileSync(path.join('userdata', 'allunlockables.json')));
    const userInventory = JSON.parse(fs.readFileSync(path.join('userdata', 'users', `${userId}.json`))).Extensions.inventory;
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

app.get('/multiplayer', extractToken, (req, res) => { // /multiplayer?gamemode=versus&disguiseUnlockableId=TOKEN_OUTFIT_ELUSIVE_COMPLETE_15_SUIT
    if (req.query.gamemode != 'versus') { // not sure what happens here
        return
    }
    res.json({
        template: null,
        data: {
            LoadoutData: getLoadoutData(req.jwt.unique_name, req.query.disguiseUnlockableId),
        }
    });
});

app.get('/missionendready', (req, res) => {
    // TODO: test if this works
    res.json({
        template: {
            "controller": "group",
            "id": "mission_rewards",
            "selectable": false,
            "pressable": false,
            "children": [{
                "view": "menu3.MissionRewardPage",
                "selectable": false,
                "pressable": false,
                "data": {
                    "loading": true
                }
            }],
            "post-load-action": {
                "link": {
                    "page": "missionend",
                    "clearhistory": true,
                    "args": {
                        "url": "missionend",
                        "contractSessionId": "$.contractSessionId",
                        "masteryUnlockableId": "$arg MasteryUnlockableId"
                    }
                }
            }
        },
        data: {
            contractSessionId: req.query.contractSessionId,
            missionEndReady: true,
            retryCount: 1,
        },
    });
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

module.exports = app;
