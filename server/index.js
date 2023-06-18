require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const db = require("./db");

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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ chatId, userName }) => {
    console.log("joined rookl");
    const chat = await ChatService.createChat(socket, chatId, userName);
    const messages = await chat.getMessages();
    console.log(messages)
    socket.join(chatId);
    console.log(`${socket.id} Joined the room: ${chatId}`);
    socket.emit('fetchedData', messages)
  });

  socket.on("sendMsg", async (data) => {
    console.log(data);
    const sender = await User.findOne({ where: { name: data.author } });
    const senderId = sender.id;
    const chatId = data.chatId;

    const chat = await Chat.findOne({where: {socketRoomId: chatId}, include: ['Messages']})
    console.log(data.msg);

    const newMessage = await Message.create({content: data.msg, type: 'text', senderId})
    
    await ChatService.addMessageToChat(chat, newMessage)
    socket.to(data.chatId).emit("receiveMsg", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

server.listen(PORT, async () => {
  try {
    await db.authenticate();
    await db.sync();
    console.log("server runnig");
  } catch (e) {
    console.log(e.message);
  }
});
