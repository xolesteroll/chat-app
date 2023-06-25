const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
  },
  wallet_address: {
    type: DataTypes.STRING,
  },
});

const Chat = sequelize.define("Chat", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  socketRoomId: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM("text", "file"),
    allowNull: false,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const File = sequelize.define("File", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
})


// Chat.belongsToMany(User, { through: 'UserChat' });
// User.belongsToMany(Chat, { through: 'UserChat' });

Chat.hasMany(Message);
Message.belongsTo(Chat);

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User);

Message.hasMany(File, {foreignKey: "messageId"});
File.belongsTo(Message)

module.exports = {
  Message,
  User,
  Chat,
  File
};
