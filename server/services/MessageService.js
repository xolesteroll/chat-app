const {Message} = require('../models')

const addNew = async (type, content, senderId, chatId) => {
    try {
        const newMessage = await Message.create({type, content, senderId, chatId})
        
        console.log(newMessage)
    } catch(e) {
        console.log(e)
    }
}

module.exports = {
    addNew
}