#!/usr/bin/env node
"use strict";

let axios = require("axios");
let async = require("async");
let path = require("path");
let stats = require("stats-lite");

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const argv = require("minimist")(process.argv.slice(2));
const SIZE = argv.size || argv.s || 1;
const FREQUENCY = argv.frequency || argv.f || 1;

var ended = 0;
var times = [];

function mess (id, message) {
	cluster.workers[id].disconnect();
	times = times.concat(message);
	ended++;
	if (ended === numCPUs) {
		console.log({
			mean : stats.mean(times),
			median: stats.median(times),
			percentiles: {
				"10":stats.percentile(times, 0.10),
				"20":stats.percentile(times, 0.20),
				"30":stats.percentile(times, 0.30),
				"40":stats.percentile(times, 0.40),
				"50":stats.percentile(times, 0.50),
				"60":stats.percentile(times, 0.60),
				"70":stats.percentile(times, 0.70),
				"80":stats.percentile(times, 0.80),
				"90":stats.percentile(times, 0.90),
				"91":stats.percentile(times, 0.91),
				"92":stats.percentile(times, 0.92),
				"93":stats.percentile(times, 0.93),
				"94":stats.percentile(times, 0.94),
				"95":stats.percentile(times, 0.95),
				"96":stats.percentile(times, 0.96),
				"97":stats.percentile(times, 0.97),
				"98":stats.percentile(times, 0.98),
				"99":stats.percentile(times, 0.99),
			}
		});
	}
}

if (cluster.isMaster) {

	console.log("Node load test runner");
	console.log("launching ", SIZE, " requests at ", FREQUENCY, " request per second, on " + numCPUs + " cores.");

// Fork workers.
	var promises = [];
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	Object.keys(cluster.workers).forEach(function (id) {
		cluster.workers[id].on('message', mess.bind(null, id));
	});
} else {
	const START = process.hrtime();
	async.timesLimit(SIZE, FREQUENCY, delay, end);

	function end(err, times) {
		process.send(times);
	}

	function callBack (TIMER, cb, res) {
		let diff = process.hrtime(TIMER);
		let time = 1000 * diff[0] + Math.floor(diff[1] / 1000000);
		cb(null, time);
	}

	function run (index, cb) {
		let TIMER = process.hrtime();
		const CB = callBack.bind(null, TIMER, cb);
		axios.post('https://w9wv7dyvb4.execute-api.eu-west-1.amazonaws.com/test/auth/local/signup', {
			credentials: {
				email: "thomas.charlatgmail.com",
				password: "123456"
			},
			partner: {
				code: "sfeir"
			}
		}, {
			headers: {
				"Content-Type": "application/json"
			},
			validateStatus: function () {
				return true;
			}
		})
		.then(CB, CB);
	}

	function delay(index, cb) {
		let diff = process.hrtime(START);
		let delay = 1000 * (index / FREQUENCY - diff[0]) - Math.floor(diff[1] / 1000000);
		setTimeout(run, delay, index, cb);
	}
}