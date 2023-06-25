import dotenv from "dotenv";
dotenv.config();
import { writeFileSync } from "fs";
import { fileTypeFromFile } from "file-type";
import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

import db from "./db.js";

import { Chat } from "./models.js";
import { User } from "./models.js";
import { Message } from "./models.js";
import ChatService from "./services/ChatService.js";
import MessagesService from "./services/MessageService.js";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
  },
});

server.listen(PORT, async () => {
  try {
    await db.authenticate();
    await db.sync();

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chatId, userName }) => {
        const chat = await ChatService.createChat(socket, chatId, userName);
        const messagesData = await chat.getMessages();
        console.log("user conntected:" + socket.id);
        const messages = messagesData.map((m) => {
          return {
            id: m.id,
            chatId: +m.chatId,
            type: m.type,
            author: m.senderName,
            msg: m.content,
            time: m.createdAt,
          };
        });

        socket.emit("fetchedData", messages);
      });

      socket.on("upload", async (files, callback) => {
        console.log("files: " + files);
        for (let key in files[0]) {
          console.log(await fileTypeFromFile(files[0][key]));
          const fileName = `file_${key}`;
          // writeFileSync("/uploads", files[0][key], (err) => {
          //   callback({message: err ? "failure" : "success"})
          // })
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
          console.log(data.chatId);

          socket.broadcast.emit("rcvMsg", data);
          await ChatService.addMessageToChat(chat, newMessage);
        } catch (e) {
          console.log(e);
        }
      });

      socket.on("disconnect", () => {
        debugger;
        console.log("user disconnected", socket.id);
      });
    });

    console.log("server runnig");
  } catch (e) {
    console.log(e.message);
  }
});
