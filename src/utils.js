import fs from 'fs-extra'

export const isExist = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (e) => {
      if (e.code === 'ENOENT') {
        resolve(false)
      } else {
        resolve(true)
      }
    })
  })
}

export const listDir = (folderPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(folderPath, (e, files) => {
      if (e) {
        reject(e)
        return
      }
      if (data && data.length > 0 && data[0] === '.DS_Store') {
        files.splice(0, 1)
      }
      resolve(files)
    })
  })
}

export const getChunkList = async (filePath, tmpPath, cb) => {
  const isFileExist = await isExist(filePath)
  if (isFileExist) {
    // TODO
    cb({
      stat: 1,
      file: {
        isExist: true,
        name: filePath
      },
      desc: 'file is exist'
    })
  } else {
    const isFolderExist = await isExist(tmpPath)
    if (isFolderExist) {
      const fileList = await listDir(tmpPath)
      cb({
        stat: 1,
        chunkList: fileList,
        desc: 'folder list'
      })
    } else {
      cb({})
    }
  }
}