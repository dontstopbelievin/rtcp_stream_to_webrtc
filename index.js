const express = require('express')
const cors = require('cors')
const Stream = require('./Custom_Stream')
var https = require('https'); // require native node's native https module
var fs = require('fs');
ws = require('ws')

const https_port = 4000
const wsPort = 443

var privateKey  = fs.readFileSync('/usr/src/app/certs/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/usr/src/app/certs/cert.pem', 'utf8');

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
      res.json({ url: `wss://demo.quant-robotics.kz:${wsPort}` })
    }else{
      res.json({ error: 'service unavailable' })
    }
  } catch (e) {
    console.error(e)
  }
})

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(https_port, () => {
  console.log(`server listening commands at https://demo.quant-robotics.kz:${https_port}`)
});
