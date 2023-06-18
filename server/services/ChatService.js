const { Chat } = require("../models");
const { Message } = require("../models");
const { User } = require("../models");

const createChat = async (socket, chatId, userName) => {
  console.log("CHATID:" + chatId);
  try {
    const [chat, created] = await Chat.findOrCreate({
      where: { socketRoomId: chatId },
      defaults: {
        socketRoomId: chatId,
      },
      include: ['Messages'],
    });

    console.log(chat);
    return chat;
  } catch (e) {
    console.log(e);
  }
};

const addMessageToChat = async (chat, message) => {
  try {
    await chat.addMessage(message);

    console.log(chat.Messages);
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createChat,
  addMessageToChat
};
