// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');

const { extractToken } = require ('./utils.js');

const app = express.Router();



// /authentication/api/userchannel/EventsService/

function encodePushMessage(timestamp, message) {
    let msgstr = JSON.stringify(message);
    let msglength = Buffer.byteLength(msgstr, 'utf8');
    let totallength = msglength + 8 + 80; // using a fixed length of 8 for the timestamp for now...
    totallength += 4 - (totallength % 4); // pad to nearest multiple of 4
    let output  = Buffer.alloc(totallength);
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
    event.CreatedAt = new Date().toISOString().slice(0,-1);
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

app.post('/SaveAndSynchronizeEvents4', extractToken, express.json(), (req, res) => {
    if (req.body.userId != req.jwt.unique_name) {
        res.status(403).send(); // Trying to save events for other user
    }
    let userQueue;
    let newEvents = null;
    // events:
    if (userQueue = eventQueue.get(req.jwt.unique_name)) {
        userQueue = userQueue.filter(item => item.time > req.body.lastEventTicks);
        eventQueue.set(req.jwt.unique_name, userQueue);

        newEvents = Array.from(userQueue, item => item.event);
    }

    // push messages:
    let pushMessages = null;
    if (userQueue = messageQueue.get(req.jwt.unique_name)) {
        userQueue = userQueue.filter(item => item.time > req.body.lastPushDt);
        messageQueue.set(req.jwt.unique_name, userQueue);

        pushMessages = Array.from(userQueue, item => item.message);
    }

    res.json({
        SavedTokens: req.body.values ? saveEvents(req.body.userId, req.body.values) : null,
        NewEvents: newEvents || null,
        NextPoll: 10.0,
        PushMessages: pushMessages || null,
    });
});

app.post('/SaveEvents2', extractToken, express.json(), (req, res) => {
    if (req.jwt.unique_name != req.body.userId) {
        res.status(403).send(); // Trying to save events for other user
        return;
    }
    res.json(saveEvents(req.body.userId, req.body.values));
});

function saveEvents(userId, events) {
    let response = [];
    events.forEach(event => {
        // Todo: handle more events
        if (event.Name == 'Ghost_PlayerDied') {

        } else if (event.Name == 'Ghost_TargetUnnoticed') {

        } else if (event.Name == 'Kill') {
            if (!event.Value.IsTarget) {
                // +1 NPC kill
            }
        } else if (event.Name == 'Pacify') {
            // event.Value.RepositoryId
        } else if (event.Name == 'BodyHidden') {

        } else if (event.Name == 'Disguise') {
            
        } else if (event.Name == 'ContractStart') {
            // event.Value.ConnectedSessions
        }
        response.push(process.hrtime.bigint().toString());
    });
    return response;
}

module.exports = {
    router: app,
    enqueuePushMessage,
    enqueueEvent,
};
