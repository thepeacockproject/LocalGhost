// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const path = require('path');
const uuid = require('uuid');
const { readFile } = require('atomically');

const { extractToken, ServerVer } = require('./utils.js');
const eventHandler = require('./eventHandler.js');

const app = express.Router();

app.post('/GetForPlay2', express.json(), extractToken, async (req, res) => {
    if (!/^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$/.test(req.body.id)) {
        res.status(400).end();
        return; // user sent some nasty info
    }
    readFile(path.join('contractdata', `${req.body.id}.json`)).then(contractfile => {
        const contractData = JSON.parse(contractfile);
        const contractSesh = {
            Contract: contractData,
            ContractSessionId: `${process.hrtime.bigint().toString()}-${uuid.v4()}`,
        };

        eventHandler.enqueueEvent(req.jwt.unique_name, {
            Version: ServerVer,
            IsReplicated: false,
            CreatedContract: null,
            Id: uuid.v4(),
            Name: 'ContractSessionMarker',
            UserId: uuid.NIL,
            ContractId: uuid.NIL,
            SessionId: null,
            ContractSessionId: contractSesh.ContractSessionId,
            Timestamp: 0.0,
            Value: {
                Currency: {
                    ContractPaymentAllowed: true,
                    ContractPayment: null,
                }
            },
            Origin: null,
        });

        res.json(contractSesh);
        eventHandler.newSession(contractSesh.ContractSessionId);
    }).catch(err => {
        if (err.code == 'ENOENT') {
            console.error(`Requested unknown contract: ${path.basename(err.path, '.json')}`);
            res.status(404).end();
        } else {
            console.error(err);
            res.status(500).end();
        }
        
    });
});

module.exports = app;
