require("dotenv").config();
const { writeFileSync } = require("fs");
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./db");

const uuid = require("uuid")

const { Chat } = require("./models");
const { User } = require("./models");
const { Message } = require("./models");
const ChatService = require("./services/ChatService");
const MessagesService = require("./services/MessageService");

const PORT = process.env.PORT || 3001;

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});


server.listen(PORT, async () => {
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
