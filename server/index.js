require("dotenv").config();
const path = require("path")
const express = require("express");
const http = require("http");
const cors = require("cors");

const { Server } = require("socket.io");
const db = require("./db");

const { Chat } = require("./models");
const { User } = require("./models");
const { Message } = require("./models");
const ChatService = require("./services/ChatService");
const {createFile} = require("./services/FilesService");
const upload = require("./multer.js");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors())
app.use(express.json())
app.use(express.static('uploads'))

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

app.post('/upload-files', upload.array("files"), async (req, res) => {
  try {
    const uploadedFiles = req.files
    console.log(uploadedFiles)
  
    const filesIds = []
  
    for (let i = 0; i < uploadedFiles.length; i++) {
      const newFile = createFile(uploadedFiles[i])
      console.log(newFile)
  
      filesIds.push(newFile.id)
    }
  
  
    res.status(200).send({message: 'ok', filesIds})
  } catch (e) {
    res.status(500).send({message: e.message})

  }
  
})

server.listen(PORT, async () => {
  try {
    await db.authenticate();
    await db.sync();

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chatId, userName }) => {
        const chat = await ChatService.createChat(socket, chatId, userName);
        const messagesData = await chat.getMessages();
    
        const messages = messagesData.map( (m) => {
          return {
            id: m.id,
            chatId: +m.chatId,
            type: m.type,
            author: m.senderName,
            msg: m.content,
            time: m.createdAt
          }
        })
    
        socket.emit('fetchedData', messages)
      });

      socket.on("upload", (files, callback) => {
        console.log(files)
        for (let key in files[0]) {
          console.log(files[0][key])
          const fileName = `file_${key}`
          // writeFileSync("/uploads", files[0][key], (err) => {
          //   callback({message: err ? "failure" : "success"})
          // })
        }
      })
    
      socket.on("sendMsg", async (data) => {
        try {
          const sender = await User.findOrCreate({ where: { name: data.author } });
          const senderId = sender.id;
          const chatId = data.chatId;
      
          const chat = await Chat.findOne({where: {socketRoomId: chatId}, include: ['Messages']})
          const newMessage = await Message.create({content: data.msg, type: data.type, senderId, senderName: data.author, chatId})
          console.log(data.chatId)
          
          socket.broadcast.emit("rcvMsg", data);
          await ChatService.addMessageToChat(chat, newMessage)
    
        } catch (e) {
          console.log(e)
        }
      });
    
      socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
      });
    });

    console.log("server runnig");
  } catch (e) {
    console.log(e.message);
  }
});