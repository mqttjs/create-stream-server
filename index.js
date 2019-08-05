var net = require('net');
var tls = require('tls');
var http = require('http');
var https = require('https');
var ws = require('ws');
var url = require('url');
var wsStream = require('websocket-stream');
var async = require('async');
var enableDestroy = require('server-destroy');

function createServer(clientHandler) {
  return net.createServer(function(client){
    clientHandler(client);
  });
}

function createSecureServer(sslOptions, clientHandler){
  return tls.createServer(sslOptions, function(client){
    clientHandler(client);
  });
}

function attachServer(server, clientHandler) {
  (new ws.Server({
    server: server
  })).on('connection', function(ws) {
    clientHandler(wsStream(ws));
  });
  return server;
}

function createWebSocketServer(clientHandler){
  var server = http.createServer();
  attachServer(server, clientHandler);
  return server;
}

function createSecureWebSocketServer(sslOptions, clientHandler){
  var server = https.createServer(sslOptions);
  attachServer(server, clientHandler);
  return server;
}

module.exports = function(serverConfig, sharedConfig, clientStreamHandler){
  if(typeof sharedConfig == 'function') {
    clientStreamHandler = sharedConfig;
    sharedConfig = {};
  }

  if(typeof sharedConfig != 'object') {
    sharedConfig = {};
  }

  var servers = {};

  Object.keys(serverConfig).forEach(function(id) {
    var config = serverConfig[id];

    if(typeof config == 'string') {
      var c = url.parse(config);
      config = {
        protocol: c.protocol.replace(/:$/, ''),
        port: c.port,
        host: c.hostname
      };
    }

    config.host = config.host || sharedConfig.host || 'localhost';
    config.ssl = config.ssl || sharedConfig.ssl;

    var server;

    if(config.attach) {
      server = attachServer(config.attach, clientStreamHandler);
      server._css_exclude = true;
    } else if(config.protocol == 'tcp') {
      server = createServer(clientStreamHandler);
    } else if(config.protocol == 'ssl') {
      server = createSecureServer(config.ssl, clientStreamHandler);
    } else if(config.protocol == 'ws') {
      server = createWebSocketServer(clientStreamHandler);
    } else if(config.protocol == 'wss') {
      server = createSecureWebSocketServer(config.ssl, clientStreamHandler);
    } else {
      throw new Error('negative attach and unknow protocol');
    }

    server._css_host = config.host;
    server._css_port = config.port;

    servers[id] = server;
  });

  return {
    servers: servers,
    listen: function(callback){
      async.mapSeries(Object.keys(servers), function(id, cb){
        var server = servers[id];
        if(server._css_exclude) return cb();
        server.listen(server._css_port, server._css_host, function(){
          enableDestroy(server);
          return cb();
        });
      }, callback || function(){});
    },
    close: function(callback){
      async.mapSeries(Object.keys(servers), function(id, cb){
        var server = servers[id];
        if(server._css_exclude) return cb();
        server.close(cb);
      }, callback || function(){});
    },
    destroy: function(callback){
      async.mapSeries(Object.keys(servers), function(id, cb){
        var server = servers[id];
        if(server._css_exclude) return cb();
        server.destroy(cb);
      }, callback || function(){});
    }
  };
};
