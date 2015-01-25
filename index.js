var net = require('net');
var tls = require('tls');
var http = require('http');
var https = require('https');
var ws = require('ws');
var _ = require('underscore');
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

  _.each(serverConfig, function(config, id){
    if(typeof config == 'string') {
      var c = url.parse(config);
      config = {
        protocol: c.protocol.replace(/:$/, ''),
        port: c.port,
        host: c.hostname
      };
    }

    config = _.defaults(config, sharedConfig, {
      host: 'localhost'
    });

    var server;

    if(config.protocol == 'tcp') {
      server = createServer(clientStreamHandler);
    } else if(config.protocol == 'ssl') {
      server = createSecureServer(config.ssl, clientStreamHandler);
    } else if(config.protocol == 'ws') {
      server = createWebSocketServer(clientStreamHandler);
    } else if(config.protocol == 'wss') {
      server = createSecureWebSocketServer(config.ssl, clientStreamHandler);
    }

    server._host = config.host;
    server._port = config.port;

    servers[id] = server;
  });

  return {
    servers: servers,
    listen: function(callback){
      async.series(_.map(servers, function(server){
        return function(cb){
          server.listen(server._port, server._host, function(){
            enableDestroy(server);
            cb();
          });
        }
      }), callback);
    },
    close: function(cb){
      async.series(_.map(servers, function(server){
        return server.close.bind(server);
      }), cb);
    },
    destroy: function(cb){
      async.series(_.map(servers, function(server){
        return server.destroy.bind(server);
      }), cb);
    }
  };
};
