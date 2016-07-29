#!/usr/bin/env node
"use strict";

console.log("Node load test runner");

let axios = require("axios");
let async = require("async");
let path = require("path");
let stats = require("stats-lite");

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const argv = require("minimist")(process.argv.slice(2));
const SIZE = argv.size || argv.s || 1;
const FREQUENCY = argv.frequency || argv.f || 1;

console.log("launching ", SIZE, " at ", FREQUENCY, " request per second");
// const batches = argv._.map(function (file) {
// 	return require(path.join(__dirname, argv._[0]));
// });

// if (cluster.isMaster) {
// // Fork workers.
// 	for (var i = 0; i < numCPUs; i++) {
// 		cluster.fork();
// 	}
// 	Object.keys
// } else {
	const START = process.hrtime();
	global.requestID = 0;
	var processed = 0;
	var requestSent = 0;
	var requestReceived = 0;
	var interval = setInterval(percentPerSecond, 100)
	async.timesLimit(SIZE, FREQUENCY, delay, end);

	function percentPerSecond () {
		var processedPercent = Math.floor(processed / SIZE * 100);
		var requestSentPercent = Math.floor(requestSent / SIZE * 100);
		var requestReceivedPercent = Math.floor(requestReceived / SIZE * 100);
		process.stdout.clearLine();
		process.stdout.cursorTo(0);
		process.stdout.write("Processed request : " + processedPercent + "%");
		if (requestSent >= SIZE - 1) {
			clearInterval(interval);
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			console.log('Done in ' + process.hrtime(START)[0] + ' seconds.')
		}
	}

	function end(err, times) {
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

	function callBack (TIMER, cb, res) {
		requestReceived++;
		let diff = process.hrtime(TIMER);
		let time = 1000 * diff[0] + Math.floor(diff[1] / 1000000);
		cb(null, time);
	}

	function run (index, cool, cb) {
		let TIMER = process.hrtime();
		const CB = callBack.bind(null, TIMER, cb);
		requestSent++;
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
		processed++;
		let diff = process.hrtime(START);
		let delay = 1000 * (index / FREQUENCY - diff[0]) - Math.floor(diff[1] / 1000000);
		setTimeout(run, delay, index, 'cool', cb);	
	}
// }