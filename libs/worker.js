"use strict";
let url = require("url");
let server = require("supertest").agent(url.format({
	protocol: 'https',
	host: 'w9wv7dyvb4.execute-api.eu-west-1.amazonaws.com',
	pathname: 'test'
}));
let async = require("async");
	
function end(err, result) {
	var times = [];
	var errors = 0;
	result.map(function (item) {
		if (item.error) {
			errors++;
		}
		times.push(item.time);
	});
	process.send({
		type: 'end',
		data: times,
		errors: errors
	});
}
function callBack (TIMER, cb, err, res) {
	let diff = process.hrtime(TIMER);
	let time = 1000 * diff[0] + Math.floor(diff[1] / 1000000);
	cb(null, {
		time: time,
		error: err
	});
}

function run (index, cb) {
	let TIMER = process.hrtime();
	const CB = callBack.bind(null, TIMER, cb);
	server
	.post('/auth/local/signup')
	.set('Content-Type', 'application/json')
	.set('Connection', 'keep-alive')
	.send({
	    credentials: {
		    email: "thomas.charlatgmail.com",
		    password: "123456"
	    },
	    partner: {
	        code: "sfeir"
	    }
	})
	.expect(400, CB);
}

function delay(START, FREQUENCY, index, cb) {
	let diff = process.hrtime(START);
	let delay = 1000 * (index / FREQUENCY - diff[0]) - Math.floor(diff[1] / 1000000);
	setTimeout(run, delay, index, cb);
}

module.exports = function (SIZE, FREQUENCY) {
	const START = process.hrtime();
	async.timesLimit(SIZE, FREQUENCY, delay.bind(null, START, FREQUENCY), end);
}