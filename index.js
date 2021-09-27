const express = require('express')
const cors = require('cors')
const Stream = require('node-rtsp-stream')

const app = express()

app.use(cors())
app.use(express.json())

const port = 3001
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

app.listen(port, () => {
  console.log(`server listening commands at http://praetorium.loc:${port}`)
})
