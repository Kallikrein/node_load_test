"use strict";

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const stats = require("stats-lite");

let times = [];
let ended = 0;
let errors = 0;

const START = process.hrtime();

module.exports = function master (SIZE, FREQUENCY) {
	console.log("Node load test runner");
	console.log("launching ", SIZE, " requests at ", FREQUENCY, " request per second, on " + numCPUs + " cores.");
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	Object.keys(cluster.workers).forEach(function (id) {
		cluster.workers[id].on('message', mess.bind(null, id));
	});
}

function log (id, report, error) {
	// stop the worker
	cluster.workers[id].disconnect();
	// console.log(report);
	times = times.concat(report);
	errors += error;
	ended++;
	if (ended === numCPUs) {
		console.log("job done with " + errors + " errors.")
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

function mess (id, message) {
	switch (message.type) {
		case 'end':
		return log(id, message.data, message.errors);
		default :
		return ;
	}
}