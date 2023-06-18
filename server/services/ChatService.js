const { Chat } = require("../models");
const { User } = require("../models");

const createChat = async (socket, chatId, userName) => {
  try {
    const chat = await Chat.findOrCreate({
      where: { soketId: chatId },
    });
    const connectedUser = await User.findOrCreate({
      where: { name: userName },
      defaults: { name: userName },
    });
    
    console.log("user was created and added to the chat");
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  createChat,
};
