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
  if (stream !== null) {
    stream.stop()
    stream = null
  }

  console.log(req.body)
  const { streamUrl } = req.body

  try {
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
    res.json({ url: `ws://127.0.0.1:${wsPort}` })
  } catch (e) {
    console.error(e)
  }
})

app.listen(port, () => {
  console.log(`server listening commands at http://127.0.0.1:${port}`)
})
