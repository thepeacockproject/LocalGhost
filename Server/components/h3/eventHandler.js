// Copyright (C) 2020-2022 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const { writeFile, readFile } = require('atomically');
const express = require('express');
const path = require('path');

const { scoreTrackingObjective, ContractSessionIdRegex, UUIDRegex } = require('../utils.js');
const objectiveInterpreter = require('../objectiveInterpreter.js');

const app = express.Router();



// /authentication/api/userchannel/EventsService/

function encodePushMessage(timestamp, message) {
    let msgstr = JSON.stringify(message);
    let msglength = Buffer.byteLength(msgstr, 'utf8');
    let totallength = msglength + 8 + 80; // using a fixed length of 8 for the timestamp for now...
    totallength += 4 - (totallength % 4); // pad to nearest multiple of 4
    let output = Buffer.alloc(totallength);
    let offset = 0;

    offset = output.writeUInt32LE(totallength, offset);
    // no idea what these first two chunks are for
    offset = output.writeUInt32LE(0x0000000C, offset);
    offset = output.writeUInt16LE(0x0008, offset);
    offset = output.writeUInt16LE(0x000E, offset);
    offset = output.writeUInt16LE(0x0007, offset);
    offset = output.writeUInt16LE(0x0008, offset);
    offset = output.writeUInt32LE(0x00000008, offset);
    offset = output.writeUInt32BE(0x00000002, offset);

    offset = output.writeUInt32LE(0x00000014, offset);
    offset = output.writeUInt16LE(0x0000, offset);
    offset = output.writeUInt16LE(0x000E, offset);
    offset = output.writeUInt16LE(0x0014, offset);
    offset = output.writeUInt16LE(0x0006, offset);
    offset = output.writeUInt16LE(0x0000, offset);
    offset = output.writeUInt16LE(0x0005, offset);
    offset = output.writeUInt16LE(0x0008, offset);
    offset = output.writeUInt16LE(0x000C, offset);
    offset = output.writeUInt32LE(0x0000000E, offset);
    offset = output.writeUInt32BE(0x00010300, offset);

    offset = output.writeUInt32LE(0x0c + 8, offset);
    offset = output.writeBigUInt64LE(timestamp, offset);
    offset = output.writeUInt16LE(0x0008, offset);
    offset = output.writeUInt16LE(0x000C, offset);
    offset = output.writeUInt16LE(0x0006, offset);
    offset = output.writeUInt16LE(0x0008, offset);
    offset = output.writeUInt32LE(0x00000008, offset);
    offset = output.writeUInt32BE(0x00008300, offset);

    offset = output.writeUInt32LE(0x04, offset);
    offset = output.writeUInt32LE(msglength, offset);
    offset = output.write(msgstr, offset, 'utf8');
    return output.toString('base64');
}

let messageQueue = new Map();
let eventQueue = new Map();

function enqueuePushMessage(userid, message) {
    let userQueue;
    let time = process.hrtime.bigint();
    if (userQueue = messageQueue.get(userid)) {
        userQueue.push({
            time: time,
            message: encodePushMessage(time, message),
        });
    } else {
        userQueue = [{
            time: time,
            message: encodePushMessage(time, message),
        }];
        messageQueue.set(userid, userQueue);
    }
}

function enqueueEvent(userid, event) {
    let userQueue;
    let time = process.hrtime.bigint().toString();
    event.CreatedAt = new Date().toISOString().slice(0, -1);
    event.Token = time.toString();
    if (userQueue = eventQueue.get(userid)) {
        userQueue.push({
            time: time,
            event: event,
        });
    } else {
        userQueue = [{
            time: time,
            event: event,
        }];
        eventQueue.set(userid, userQueue);
    }
}

async function newSession(sessionId, contractId, userId, gameVersion) {
    timestamp = new Date();

    let contractSession = {
        sessionStart: timestamp,
        lastUpdate: timestamp,
        contractId: contractId,
        userId: userId,
        isParsed: false,
        events: {},
    };

    // todo: set userdata current session

    await writeFile(path.join('userdata', gameVersion, 'contractsessions', `${sessionId}.json`), JSON.stringify(contractSession));
}

async function endSession(sessionId, gameVersion) {
    const contractSession = await getContractSession(sessionId, gameVersion);
    const contractData = JSON.parse(await readFile(path.join('contractdata', `${contractSession.contractId}.json`)));
    const objectives = [...contractData.Data.Objectives];
    const gameChangerData = JSON.parse(await readFile(path.join('menudata', 'h3', 'menudata', 'GameChangerProperties.json')));
    for (const gameChangerId of contractData.Data.GameChangers) {
        if (!UUIDRegex.test(gameChangerId) || !Object.hasOwn(gameChangerData, gameChangerId)) {
            console.error(`Encountered unknown gamechanger id: ${gameChangerId}`);
            continue;
        }
        const gameChanger = gameChangerData[gameChangerId];
        objectives.push(...gameChanger.Objectives);
    }

    const results = objectiveInterpreter.handleEvents([
        ...objectives,
        scoreTrackingObjective,
        // ...challenges, // TODO
        // ...playStyles, // TODO
    ], Object.entries(contractSession.events).map(([id, event]) => ({
        ...event,
        Id: id,
        ContractId: contractSession.contractId,
        ContractSessionId: sessionId,
        UserId: contractSession.userId,
    })));

    // TODO: handle progression here

    // save all results in contractSession
    contractSession.results = {
        objectives: objectives.map(obj => ({
            Id: obj.Id,
            endState: results[obj.Id].endState,
            excludeFromScoring: obj.ExcludeFromScoring || false,
        })),
        scoretracker: results[scoreTrackingObjective.Id],
        // playStyles: playStyles.map(obj => results[obj.Id]),
    };

    contractSession.isParsed = true;

    // todo: set userdata current session

    await writeFile(path.join('userdata', gameVersion, 'contractsessions', `${sessionId}.json`), JSON.stringify(contractSession));
}

app.post('/SaveAndSynchronizeEvents4', express.json({ limit: '5Mb' }), async (req, res) => {
    if (req.body.userId !== req.jwt.unique_name) {
        res.status(403).end(); // Trying to save events for other user
        return;
    }
    if (!Array.isArray(req.body.values)) {
        res.status(400).end(); // malformed request
        return;
    }

    let userQueue;
    let newEvents = null;
    // events: (server->client)
    if (userQueue = eventQueue.get(req.jwt.unique_name)) {
        userQueue = userQueue.filter(item => item.time > req.body.lastEventTicks);
        eventQueue.set(req.jwt.unique_name, userQueue);

        newEvents = Array.from(userQueue, item => item.event);
    }

    // push messages: (server->client)
    let pushMessages = null;
    if (userQueue = messageQueue.get(req.jwt.unique_name)) {
        userQueue = userQueue.filter(item => item.time > req.body.lastPushDt);
        messageQueue.set(req.jwt.unique_name, userQueue);

        pushMessages = Array.from(userQueue, item => item.message);
    }

    let eventServerIds = null;
    if (req.body.values.length) {
        eventServerIds = await saveEvents(req.body.userId, req.body.values, req.gameVersion);
        if (eventServerIds.length != req.body.values.length) {
            // only codepath that does this is a user error
            res.status(400).end();
            return;
        }
    }

    res.json({
        SavedTokens: eventServerIds,
        NewEvents: newEvents || null,
        NextPoll: 10.0,
        PushMessages: pushMessages || null,
    });
});

app.post('/SaveEvents2', express.json({ limit: '5Mb' }), async (req, res) => {
    if (req.jwt.unique_name !== req.body.userId) {
        res.status(403).end();
        console.warn('/SaveEvents2: Trying to save events for other user');
        return;
    }
    if (!Array.isArray(req.body.values)) {
        res.status(400).end();
        console.warn('/SaveEvents2: malformed request');
        return;
    }


    const eventServerIds = await saveEvents(req.body.userId, req.body.values, req.gameVersion);
    if (eventServerIds.length != req.body.values.length) {
        // only codepath that does this is a user error
        res.status(400).end();
    } else {
        res.json(eventServerIds);
    }
});

async function saveEvents(userId, events, gameVersion) {
    let response = [];
    const endedContracts = new Set();
    const editedSessions = new Map();
    for (const event of events) {
        if (!ContractSessionIdRegex.test(event.ContractSessionId)) {
            console.warn('Invalid session id in event');
            return;
        }
        if (!editedSessions.has(event.ContractSessionId)) {
            const sessionDetails = await getContractSession(event.ContractSessionId, gameVersion).catch(err => {
                if (err.code !== 'ENOENT') { // error other than non-existant session
                    console.error(err);
                }
                return null;
            });
            if (sessionDetails === null) {
                return;
            }
            editedSessions.set(event.ContractSessionId, sessionDetails);
        }
        const session = editedSessions.get(event.ContractSessionId);
        if (!session || session.contractId !== event.ContractId || session.userId !== userId) {
            console.warn(`Invalid event received from user ${userId}`);
            return; // session does not exist or contractid/userid doesn't match
        }
        session.lastUpdate = new Date();

        let savedEvent = session.events[event.Id];
        if (savedEvent) { // event was already added
            response.push(savedEvent.eventServerId);
        } else { // new event
            if (event.Name === 'ContractEnd') {
                // todo: or contractfailed I guess?
                endedContracts.add(event.ContractSessionId);
            }

            eventServerId = process.hrtime.bigint().toString();
            event.eventServerId = eventServerId;
            session.events[event.Id] = event;
            response.push(eventServerId);

            // delete unneccessary fields
            // some of these could in theory be used by some statemachines, but that sounds stupid
            delete event.Origin;
            delete event.SessionId;
            // I assume these are equal for all events in one session, so no need to save them each time
            // they get added again in endSession()
            delete event.ContractId;
            delete event.ContractSessionId;
            delete event.UserId;
            delete event.Id;
        }
    }

    for (const [sessionId, sessionDetails] of editedSessions) {
        await writeFile(path.join('userdata', gameVersion, 'contractsessions', `${sessionId}.json`), JSON.stringify(sessionDetails));
    }

    for (const sessionId of endedContracts) {
        endSession(sessionId, gameVersion).catch(err => {
            console.error(err);
            // todo: better error handling
        });
    }

    return response;
}

async function getContractSession(sessionId, gameVersion) {
    return JSON.parse(await readFile(path.join('userdata', gameVersion, 'contractsessions', `${sessionId}.json`)))
}

function cleanupOldSessions() {
    // todo
}

module.exports = {
    router: app,
    enqueuePushMessage,
    enqueueEvent,
    getContractSession,
    newSession,
    cleanupOldSessions,
};
