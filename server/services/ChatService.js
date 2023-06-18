const { Chat } = require("../models");
const { Message } = require("../models");
const { User } = require("../models");

const createChat = async (socket, chatId, userName) => {
  try {
    const [chat, created] = await Chat.findOrCreate({
      where: { socketRoomId: chatId },
      defaults: {
        socketRoomId: chatId,
      },
      include: ['Messages'],
    });

    return chat;
  } catch (e) {
    console.log(e);
  }
};

const addMessageToChat = async (chat, message) => {
  try {
    await chat.addMessage(message);

  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createChat,
  addMessageToChat
};
