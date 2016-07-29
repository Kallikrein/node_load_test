#!/usr/bin/env node
"use strict";

const cluster = require('cluster');


const argv = require("minimist")(process.argv.slice(2));
const SIZE = argv.size || argv.s || 1;
const FREQUENCY = argv.frequency || argv.f || 1;

if (cluster.isMaster) {
	require('./libs/master')(SIZE, FREQUENCY);
} else {
	require('./libs/worker')(SIZE, FREQUENCY);
}