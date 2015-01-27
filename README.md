# create-stream-server&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mqttjs/create-stream-server.png)](https://travis-ci.org/mqttjs/create-stream-server)

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

## Contributing

create-stream-server is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [CONTRIBUTING.md](https://github.com/mqttjs/create-stream-server/blob/master/CONTRIBUTING.md) file for more details.

### Contributors

create-stream-server is only possible due to the excellent work of the following contributors:

<table><tbody>
<tr><th align="left">Joël Gähwiler</th><td><a href="https://github.com/256dpi">GitHub/256dpi</a></td><td><a href="http://twitter.com/256dpi">Twitter/@256dpi</a></td></tr>
<tr><th align="left">Matteo Collina</th><td><a href="https://github.com/mcollina">GitHub/mcollina</a></td><td><a href="http://twitter.com/matteocollina">Twitter/@matteocollina</a></td></tr>
</tbody></table>

### License

MIT
