const express = require('express')
const cors = require('cors')
const Stream = require('node-rtsp-stream')
var https = require('https'); // require native node's native https module
var fs = require('fs');
ws = require('ws')

const https_port = 8086
const wsPort = 9997

delete Stream.prototype['pipeStreamToSocketServer'];
Stream.prototype.pipeStreamToSocketServer = function(){
  console.log("The functionality has been overridden.");
  const server = https.createServer({
    cert: fs.readFileSync('/usr/src/app/certs/praetorium.loc.crt'),
    key: fs.readFileSync('/usr/src/app/certs/praetorium.loc.key'),
  }).listen(wsPort, '0.0.0.0');
  this.wsServer = new ws.Server({
    server
  })
  this.wsServer.on("connection", (socket, request) => {
    return this.onSocketConnect(socket, request)
  })
  this.wsServer.broadcast = function(data, opts) {
    var results
    results = []
    for (let client of this.clients) {
      if (client.readyState === 1) {
        results.push(client.send(data, opts))
      } else {
        results.push(console.log("Error: Client from remoteAddress " + client.remoteAddress + " not connected."))
      }
    }
    return results
  }
  return this.on('camdata', (data) => {
    return this.wsServer.broadcast(data)
  })
}
module.exports = Stream

var privateKey  = fs.readFileSync('/usr/src/app/certs/praetorium.loc.key', 'utf8');
var certificate = fs.readFileSync('/usr/src/app/certs/praetorium.loc.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const app = express()

app.use(cors())
app.use(express.json())

let stream = null

app.post('/start', function (req, res) {
  // if (stream !== null) {
  //   stream.stop()
  //   stream = null
  // }

  console.log(req.body)
  const { streamUrl } = req.body

  try {
    if(stream == null){
      stream = new Stream({
        name: 'videoStream',
        streamUrl: streamUrl,
        wsPort: wsPort,
      })
      stream.wsServer.on("connection", (socket, request) => {
        return socket.on("close", (code, message) => {
          if(stream.wsServer.clients.size == 0){
            stream.stop()
            stream = null
          }
          return
        })
      })
    }
    if(stream !== null){
      res.json({ url: `wss://praetorium.loc:${wsPort}` })
    }else{
      res.json({ error: 'service unavailable' })
    }
  } catch (e) {
    console.error(e)
  }
})

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(https_port, () => {
  console.log(`server listening commands at https://praetorium.loc:${https_port}`)
});

// app.listen(https_port, () => {
//   console.log(`server listening commands at http://praetorium.loc:${port}`)
// })
