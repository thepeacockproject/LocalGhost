// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const uuid = require('uuid');
const { readFile } = require('atomically');

const { extractToken } = require('./utils.js');
const eventHandler = require('./eventHandler.js');
const { enqueuePushMessage } = require('./eventHandler.js');

const app = express.Router();

app.post('/GetRequiredResourcesForPreset', express.json(), async (req, res) => {
    let presetData = JSON.parse(await readFile(path.join('menudata', 'menudata', 'multiplayerpresets.json')));
    let preset = presetData.data.Presets.find(preset => preset.Id == req.body.id);
    res.json(preset ? preset.Data.Contracts.map(contractId => {
        let contract = presetData.data.UserCentricContracts.find(contract => contract.Contract.Metadata.Id == contractId);
        return contract ? {
            Id: contractId,
            DlcId: contract.Data.DlcName,
            Resources: Array.of(contract.Contract.Metadata.ScenePath, ...contract.Contract.Data.Bricks),
        } : null
    }).filter(c => c) : []);
});

let activeMatches = new Map();

app.post('/RegisterToMatch', extractToken, express.json(), async (req, res) => {
    // get a random contract from the list of possible ones in the selected preset
    let multiplayerPresets = JSON.parse(await readFile(path.join('menudata', 'menudata', 'multiplayerpresets.json')));
    let preset = multiplayerPresets.data.Presets.find(preset => preset.Id == req.body.presetId);
    if (!preset) { // preset not found
        res.status(404).end();
        return;
    }

    if (preset.Data.Properties.mode == 'matchmaking') {
        res.json({
            MatchId: uuid.v4(),
            PreferedHostIndex: 0,
            Tickets: [],
            MatchMode: null,
            MatchData: null,
            MatchStats: {},
            MatchType: 0
        });
        return;
    }

    let contractId = preset.Data.Contracts[Math.trunc(Math.random() * preset.Data.Contracts.length)];

    if (req.body.matchId == uuid.NIL) { // create new match
        req.body.matchId = uuid.v4();
        activeMatches.set(req.body.matchId, {
            MatchData: {
                contractId: contractId,
            },
            Players: [req.jwt.unique_name],
        });
    } else if (activeMatches.has(req.body.matchId)) { // join existing match
        let match = activeMatches.get(req.body.matchId);
        match.Players.forEach(playerId => eventHandler.enqueuePushMessage(playerId, {
            MatchId: req.body.matchId,
            Type: 1,
            PlayerId: req.jwt.unique_name,
            MatchData: null
        }));
        match.Players.push(req.jwt.unique_name);
    } else { // MatchId not found
        res.status(404).send();
        return;
    }

    eventHandler.enqueuePushMessage(req.jwt.unique_name, {
        MatchId: req.body.matchId,
        Type: 3,
        PlayerId: uuid.NIL,
        MatchData: activeMatches.get(req.body.matchId).MatchData,
    });

    res.json({
        MatchId: req.body.matchId,
        PreferedHostIndex: 0,
        Tickets: [],
        MatchMode: null,
        MatchData: null,
        MatchStats: {},
        MatchType: 0
    });
});

app.post('/SetMatchData', extractToken, express.json(), (req, res) => {
    let match = activeMatches.get(req.body.matchId)
    if (match && match.Players.includes(req.jwt.unique_name)) {
        match.MatchData[req.body.key] = req.body.value;
        res.json({
            MatchId: req.body.matchId,
            PreferedHostIndex: 0,
            Tickets: [],
            MatchMode: null,
            MatchData: match.MatchData,
            MatchStats: {},
            MatchType: 0
        });
    } else {
        res.status(404).send();
    }
});

let matchmaking = {};

app.post('/RegisterToPreset', extractToken, express.json(), async (req, res) => { // enter matchmaking
    // req.body.presetId
    // req.body.lobbyId (steam lobby id?)
    // req.body.platformBlocklist (null)
    // req.body.previousFailedMatch
    let presets = JSON.parse(await readFile(path.join('menudata', 'menudata', 'multiplayerpresets.json')));
    let preset = presets.data.Presets.find(preset => preset.Id == req.body.presetId);
    if (!preset) { // preset not found
        res.status(404).end();
        return;
    }
    let ticket = uuid.v4();
    res.json({
        TicketId: ticket,
        ExpectedWaitTime: 0
    });

    let matchesToJoin = [];

    preset.Data.Contracts.forEach(contractId => {
        let array = matchmaking[contractId] || [];
        array.forEach(match => matchesToJoin.push(match));
    });

    if (matchesToJoin.length > 0) { // a match is available
        let matchToJoin = matchesToJoin[Math.trunc(Math.random() * matchesToJoin.length)];
        let matchId = uuid.v4();
        activeMatches.set(matchId, {
            MatchData: {
                contractId: matchToJoin.contractId,
            },
            Players: [req.jwt.unique_name, matchToJoin.user],
        });
        // send push message to both users
        enqueuePushMessage(req.jwt.unique_name, {
            TicketId: ticket,
            MatchId: matchId,
            State: 0,
            Lobby: matchToJoin.lobby,
            IsHost: false,
            MatchData: activeMatches.get(matchId).MatchData,
        });
        enqueuePushMessage(matchToJoin.user, {
            TicketId: matchToJoin.ticket,
            MatchId: matchId,
            State: 0,
            Lobby: matchToJoin.lobby,
            IsHost: false,
            MatchData: activeMatches.get(matchId).MatchData,
        });
        Object.keys(matchmaking).forEach(contractId => {
            // remove joined match from all contracts in matchmaking
            matchmaking[contractId] = matchmaking[contractId].filter(match => match.ticket != matchToJoin.ticket);
        });
    } else { // no match is available, enter queue
        preset.Data.Contracts.forEach(contractId => {
            let array = matchmaking[contractId] || [];
            matchmaking[contractId] = array;
            array.push({
                contractId: contractId,
                ticket: ticket,
                user: req.jwt.unique_name,
                lobby: req.body.lobbyId,
            });
        });
    }
});

app.post('/CancelRegistration', express.json(), (req, res) => { // cancel matchmaking
    Object.keys(matchmaking).forEach(contractId => {
        // remove match from all contracts in matchmaking
        matchmaking[contractId] = matchmaking[contractId].filter(match => match.ticket != req.body.ticketId);
    });

    res.json({
        TicketId: req.body.ticketId,
        CancelSuccess: false // unused?
    });
});

module.exports = app;
