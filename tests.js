var assert = require('assert');
var fs = require('fs');
var net = require('net');
var tls = require('tls');
var ws = require('ws');

var css = require('./index');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // trust self signed certificate

var ssl = {
  key: fs.readFileSync('./support/server.key'),
  cert: fs.readFileSync('./support/server.crt')
};

describe('create-stream-server', function(){
  it('should create a single tcp server', function(done){
    var s = css({
      s1: 'tcp://localhost:9001'
    }, function(stream){
      stream.on('data', function(){
        done();
      });
    });

    s.listen(function(){
      var c = net.connect(9001, function(){
        c.write('A');
      });
    });
  });

  it('should create a single ssl server', function(done){
    var s = css({
      s1: 'ssl://localhost:9002'
    }, {
      ssl: ssl
    }, function(stream){
      stream.on('data', function(){
        done();
      });
    });

    s.listen(function(){
      var c = tls.connect(9002, function(){
        c.write('A');
      });
    });
  });

  it('should create a single ws server', function(done){
    var s = css({
      s1: 'ws://localhost:9003'
    }, function(stream){
      stream.on('data', function(){
        done();
      });
    });

    s.listen(function(){
      var c = ws.connect('ws://localhost:9003', function(){
        c.send('A');
      });
    });
  });

  it('should create a single wss server', function(done){
    var s = css({
      s1: 'wss://localhost:9004'
    }, {
      ssl: ssl
    }, function(stream){
      stream.on('data', function(){
        done();
      });
    });

    s.listen(function(){
      var c = ws.connect('wss://localhost:9004', function(){
        c.send('A');
      });
    });
  });

  it('should allow object config', function(done){
    var s = css({
      s1: {
        protocol: 'ssl',
        port: 9005,
        ssl: ssl
      }
    }, function(stream){
      stream.on('data', function(){
        done();
      });
    });

    s.listen(function(){
      var c = tls.connect(9005, function(){
        c.write('A');
      });
    });
  });

  it('should close servers', function(done){
    var s = css({
      s1: 'tcp://localhost:9006'
    }, function(){});

    s.servers.s1.on('close', function(){
      done();
    });

    s.listen(function(){
      s.close();
    });
  });

  it('should destroy servers', function(done){
    var s = css({
      s1: 'tcp://localhost:9007'
    }, function(){});

    s.servers.s1.on('close', function(){
      done();
    });

    s.listen(function(){
      s.destroy();
    });
  });

  it('should create multiple servers', function(done){
    var servers = css({
      s1: 'tcp://localhost:9008',
      s2: 'ssl://0.0.0.0:9009',
      s3: {
        protocol: 'wss',
        host: 'localhost',
        port: 9010
      }
    }, {
      ssl: ssl
    }, function(){});

    servers.listen(function(){
      servers.close(function(){
        done();
      });
    });
  });
});
