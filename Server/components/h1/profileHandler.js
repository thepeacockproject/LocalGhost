// Copyright (C) 2020-2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');

const { getEntitlements } = require('./platformEntitlements.js');

const app = express.Router();

// /authentication/api/userchannel/

app.post('/ProfileService/GetPlatformEntitlements', express.json(), getEntitlements);

app.post('/AuthenticationService/GetBlobOfflineCacheDatabaseDiff', (req, res) => {
    // Which menu files should be loaded from the server?
    // TODO
    res.json([]);
});

module.exports = {
    router: app,
};
