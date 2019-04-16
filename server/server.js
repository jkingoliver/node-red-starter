// Uncomment following to enable zipkin tracing, tailor to fit your network configuration:
// var appzip = require('appmetrics-zipkin')({
//     host: 'localhost',
//     port: 9411,
//     serviceName:'frontend'
// });

require('appmetrics-dash').attach();
require('appmetrics-prometheus').attach();
const appName = require('./../package').name;
const http = require('http');
const express = require('express');
const log4js = require('log4js');
const localConfig = require('./config/local.json');
const path = require('path');
var RED = require("node-red");

const logger = log4js.getLogger(appName);
logger.level = process.env.LOG_LEVEL || 'info'
const app = express();
const server = http.createServer(app);

app.use(log4js.connectLogger(logger, { level: logger.level }));
const serviceManager = require('./services/service-manager');
require('./services/index')(app);
require('./routers/index')(app, server);

// Add your code here
// Create the settings object - see default settings.js file for other options



var settings = {
  httpAdminRoot:"/red",
  httpNodeRoot: "/api",
  userDir:"/home/nol/.nodered/",
  functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot,RED.httpNode);

// END test
const port = process.env.PORT || localConfig.port;
server.listen(port, function(){
  logger.info(`nodeExpressWithNodeRed listening on http://localhost:${port}/appmetrics-dash`);
  logger.info(`nodeExpressWithNodeRed listening on http://localhost:${port}`);
});

app.use(function (req, res, next) {
  res.sendFile(path.join(__dirname, '../public', '404.html'));
});

app.use(function (err, req, res, next) {
	res.sendFile(path.join(__dirname, '../public', '500.html'));
});

// Start the runtime
RED.start();

module.exports = server;