require('dotenv').config();
const express = require('express')
const app = express()
const http = require('http')
const cors = require('cors')
const {Server} = require('socket.io')
const db = require('./db')

const PORT = process.env.PORT || 5000;


app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

io.on('connection', (socket) => {
    console.log(socket.id)

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId)
        console.log(`${socket.id} Joined the room: ${roomId}`)
    })

    socket.on('sendMsg', (data) => {
        console.log(data)
        socket.to(data.roomId).emit('receiveMsg', data)
    })

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    })
})

server.listen(PORT, async () => {
    try {
        await db.authenticate();
        await db.sync();
        console.log("server runnig")
    } catch(e) {
        console.log(e.message)
    }
})
