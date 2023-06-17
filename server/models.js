const sequelize = require("./db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: false
  },
});

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("text", "file"),
    allowNull: false,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  filepath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

User.hasMany(Message, { as: "sentMessages", foreignKey: "senderId" });
User.belongsToMany(Chat, { through: "UserChat" })

Chat.belongsToMany(User, { through: "UserChat" });
Chat.hasMany(Message);

Message.belongsTo(Chat);
Message.belongsTo(User);

module.exports = {
  Message,
  User,
  Chat,
};