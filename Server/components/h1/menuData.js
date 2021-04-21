// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');
const { extractToken, getTemplate, internalGet } = require('../utils.js');

const app = express.Router();

app.get('/dashboard//Dashboard_Category_:category/:subscriptionId/:type/:id', async (req, res, next) => {
    // redirect internally to h3 menuData.js by adding /:mode to the url
    // this doesn't preserve the query, but that isn't used.
    req.url = `/dashboard/Dashboard_Category_${req.params.category}/${req.params.subscriptionId}/${req.params.type}/${req.params.id}/templateplease`;
    next();
});

app.get('/Safehouse', extractToken, async (req, res, next) => {
    const template = await getTemplate('Safehouse', req.gameVersion);

    // call /SafehouseCategory but rewrite the result a bit
    req.url = `/SafehouseCategory?page=0&type=${req.query.type}&subtype=`;
    let originalJsonFunc = res.json;
    let rewritingJsonFunc = function json(originalData) {
        originalJsonFunc.call(this, {
            template: template,
            data: {
                SafehouseData: originalData.data,
            }
        });
    }

    res.json = rewritingJsonFunc;
    next();
});

module.exports = app;
