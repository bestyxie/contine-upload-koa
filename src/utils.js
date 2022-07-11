const fs = require('fs-extra')
const path = require('path')

const isExist = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (e) => {
      if (e && e.code === 'ENOENT') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

module.exports.isExist = isExist

const listDir = (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (e, files) => {
      if (e) {
        reject(e)
        return
      }
      if (files && files.length > 0 && files[0] === '.DS_Store') {
        files.splice(0, 1)
      }
      resolve(files)
    })
  })
}

module.exports.listDir = listDir

module.exports.getChunkList = async (filePath, tmpPath, cb) => {
  const isFileExist = await isExist(filePath)
  if (isFileExist) {
    return {
      stat: 1,
      file: {
        isExist: true,
        name: filePath
      },
      desc: 'file is exist'
    }
  } else {
    const isFolderExist = await isExist(tmpPath)
    if (isFolderExist) {
      const fileList = await listDir(tmpPath)
      return {
        stat: 1,
        chunkList: fileList,
        desc: 'folder list'
      }
    } else {
      return {}
    }
  }
}

const mergeRecursive = (fileList, fileWriteStream, sourceFilePath) => {
  if (!fileList.length) {
    return fileWriteStream.close()
  }
  const currentFile = path.resolve(__dirname, sourceFilePath, fileList.shift())
  const currentReadStream = fs.createReadStream(currentFile)

  currentReadStream.pipe(fileWriteStream, { end: false })
  currentReadStream.on('end', () => {
    mergeRecursive(fileList, fileWriteStream, sourceFilePath)
  })
  currentReadStream.on('error', (e) => {
    console.error(e)
    fileWriteStream.close()
  })
}

module.exports.mergeRecursive = mergeRecursive

// module.exports.mergeFile = (fileList, target) => {
//   const writeStream = fs.createWriteStream(filePath, { autoClose: false })
//   mergeRecursive(fileList, writeStream, )
//   return new Promise((resolve, reject) => {
//     const readable = fs.createReadStream(source)
//     readable.pipe(writable)
//     readable.on('end', () => {
//       resolve(true)
//     })
//     readable.on('error', (e) => {
//       reject(e)
//     })
//   })
// }
