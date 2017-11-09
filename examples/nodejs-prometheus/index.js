'use strict';

const express = require('express');
const client = require('prom-client');
const server = express();
const register = new client.Registry();

/**
 * Prometheus client example
 */

const h = new client.Histogram({
	name: 'test_histogram',
	help: 'Example of a histogram',
	labelNames: ['code']
});

const c = new client.Counter({
	name: 'test_counter',
	help: 'Example of a counter',
	labelNames: ['code']
});

const g = new client.Gauge({
	name: 'test_gauge',
	help: 'Example of a gauge',
	labelNames: ['method', 'code']
});

setTimeout(() => {
	h.labels('200').observe(Math.random());
	h.labels('300').observe(Math.random());
}, 10);

setInterval(() => {
	c.inc({ code: 200 });
}, 5000);

setInterval(() => {
	c.inc({ code: 400 });
}, 2000);

setInterval(() => {
	c.inc();
}, 2000);

setInterval(() => {
	g.set({ method: 'get', code: 200 }, Math.random());
	g.set(Math.random());
	g.labels('post', '300').inc();
}, 100);

server.get('/metrics', (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(register.metrics());
});

server.get('/metrics/counter', (req, res) => {
	res.set('Content-Type', register.contentType);
	res.end(register.getSingleMetricAsString('test_counter'));
});

//Enable collection of default metrics
client.collectDefaultMetrics({ register });

/**
 * JSON HTTP logging example
 */
const log4js = require('log4js');
const logger = log4js.getLogger();
log4js.configure({
  appenders: {
    console: { type: "console" },
    logfaces: { type: 'logFaces-HTTP', url: 'http://localhost:9700' }
  },
  categories: {
    default: { appenders: [ 'console', 'logfaces' ], level: 'info' }
  }
});
setInterval(() => {
	logger.level = 'debug';
	logger.debug("Some debug message");
}, 2000);


/**
 * Starting server
 */

console.log('Server listening to 8080, metrics exposed on /metrics endpoint');
server.listen(8080);
