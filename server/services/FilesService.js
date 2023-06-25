const {File} = require("./../models.js")
const createFile = async (file) => {

  const newFile = await File.create({
    name: file.filename,
    path: file.path
  })

  return newFile
}

module.exports = {
  createFile
}