const express = require('express')
const cors = require('cors')
const Stream = require('node-rtsp-stream')
var https = require('https'); // require native node's native https module
var fs = require('fs');

var privateKey  = fs.readFileSync('./certs/praetorium.loc.pem', 'utf8');
var certificate = fs.readFileSync('./certs/praetorium.loc.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const app = express()

app.use(cors())
app.use(express.json())

// const port = 3001
const https_port = 8086
const wsPort = 9997

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
      res.json({ url: `ws://praetorium.loc:${wsPort}` })
    }else{
      res.json({ error: 'service unavailable' })
    }
  } catch (e) {
    console.error(e)
  }
})

var serverSecured = https.createServer(credentials, app);

httpsServer.listen(https_port, () => {
  console.log(`server listening commands at https://praetorium.loc:${https_port}`)
});

// app.listen(https_port, () => {
//   console.log(`server listening commands at http://praetorium.loc:${port}`)
// })
