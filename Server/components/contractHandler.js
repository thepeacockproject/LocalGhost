const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');

const { extractToken, ServerVer } = require ('./utils.js');
const eventHandler = require('./eventHandler.js');

const app = express.Router();

app.post('/GetForPlay2', express.json(), extractToken, (req, res) => {
    const contractData = JSON.parse(fs.readFileSync(path.join('contractdata', `${req.body.id}.json`)));
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
});

module.exports = app;
