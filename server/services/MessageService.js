const {Message} = require('../models')
const {User} = require('../models')

const addNew = async (type, content, senderId, chatId) => {
    try {
        const newMessage = await Message.create({type, content, senderId, chatId})
        
    } catch(e) {
        console.log(e)
    }
}

const getMessageSenderNameById = async(senderId) => {
    try {
        const sender = await User.findByPk(senderId)
        const senderName = sender.name

        return senderName
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    addNew,
    getMessageSenderNameById
}