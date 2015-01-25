# create-stream-server

**create multiple stream servers easily**

## Example

```js
var css = require('create-stream-server');

var servers = css({
  s1: 'tcp://localhost:8080',
  s2: 'ssl://0.0.0.0:80',
  s3: {
    protocol: 'wss',
    host: 'localhost',
    port: 8888,
    ssl: {
      key: fs.readFileSync('./wss_server.key'),
      cert: fs.readFileSync('./wss_server.crt')
    }
  }
}, {
  ssl: {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
  }
}, function(clientStream, server){
  // handle the connected client as a stream
});

// to start
servers.listen(function(){
  console.log('launched!');
});

// after some time
servers.close(function(){
  console.log('done!');
});

// to release all resources
servers.destroy(function(){
  console.log('all gone!');
});
```

