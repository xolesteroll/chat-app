require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");

const { Server } = require("socket.io");
const db = require("./db");

const { Chat } = require("./models");
const { User } = require("./models");
const { Message } = require("./models");
const { File } = require("./models");
const ChatService = require("./services/ChatService");
const { createFile } = require("./services/FilesService");
const upload = require("./multer.js");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://skynet.pw", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

app.post("/upload-files", upload.array("files"), async (req, res) => {
  try {
    const uploadedFiles = req.files;

    const filesIds = [];

    for (let i = 0; i < uploadedFiles.length; i++) {
      const newFile = await createFile(uploadedFiles[i]);
      filesIds.push(newFile.id);
    }

    res.status(200).send({ message: "ok", filesIds });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

server.listen(PORT, async () => {
  try {
    await db.authenticate();
    await db.sync();

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chatId, userName }) => {
        try {
          const chat = await ChatService.createChat(socket, chatId, userName);
          const messagesData = await chat.getMessages({ include: ["Files"] });
          const messages = [];

          for (let i = 0; i < messagesData.length; i++) {
            const m = messagesData[i];
            const files = await m.getFiles();
            const filesData = files.map((f) => ({
              name: f.name,
              url: "http://localhost:3001/" + f.path,
            }));

            const messageObj = {
              id: m.id,
              chatId: +m.chatId,
              type: m.type,
              author: m.senderName,
              msg: m.content,
              time: m.createdAt,
              files: filesData && filesData.length > 0 ? filesData : [],
            };

            messages.push(messageObj);
          }
          // const messages = messagesData.map(async (m) => {
          //   return
          // });

          socket.emit("fetchedData", messages);
        } catch (e) {
          console.log(e.message);
        }
      });

      socket.on("sendMsg", async (data) => {
        try {
          const sender = await User.findOrCreate({
            where: { name: data.author },
          });
          const senderId = sender.id;
          const chatId = data.chatId;

          const chat = await Chat.findOne({
            where: { socketRoomId: chatId },
            include: ["Messages"],
          });
          const newMessage = await Message.create({
            content: data.msg,
            type: data.type,
            senderId,
            senderName: data.author,
            chatId,
          });
          console.log(data.filesIds);
          data.files = [];

          if (data.filesIds && data.filesIds.length > 0) {
            for (let i = 0; i < data.filesIds.length; i++) {
              const uploadedFile = await File.findByPk(data.filesIds[i]);
              console.log(uploadedFile)
              if (uploadedFile) {
                data.files.push({
                  name: uploadedFile.name,
                  url: "http://localhost:3001/" + uploadedFile.path,
                });
  
                await newMessage.addFile(uploadedFile);

              }
            }
          }

          socket.emit("rcvMsg", data);
          await ChatService.addMessageToChat(chat, newMessage);
        } catch (e) {
          console.log(e);
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
