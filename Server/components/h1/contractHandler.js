// Copyright (C) 2021 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');

const app = express.Router();

app.post('/GetForPlay', async (req, res, next) => {
    // call /GetForPlay2 but rewrite the result a bit
    req.url = '/GetForPlay2';
    let originalJsonFunc = res.json;
    let rewritingJsonFunc = function json(originalData) {
        originalJsonFunc.call(this, originalData.Contract);
    }

    res.json = rewritingJsonFunc;
    next();
});

module.exports = app;
