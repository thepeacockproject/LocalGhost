// Copyright (C) 2020 grappigegovert <grappigegovert@hotmail.com>
// Licensed under the zlib license. See LICENSE for more info

const express = require('express');

const app = express.Router();

// /resources-7-17/

app.use('/', express.static('menudata'));

module.exports = app;
