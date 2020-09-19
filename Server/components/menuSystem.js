const express = require('express');

const app = express.Router();

// /resources-7-17/

app.use('/', express.static('menudata'));

module.exports = app;
