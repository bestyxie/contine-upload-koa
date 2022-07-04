import SparkMD5 from "spark-md5"

export const splitFile = (file: File, defaultChunkSize: number = 100): Promise<{ fileHash: string; fileReader: FileReader }> => {
  return new Promise((resolve, reject) => {
    let blobSlice = File.prototype.slice

    const chunks = Math.ceil(file.size / defaultChunkSize)
    let currentChunk = 0
    const spard = new SparkMD5.ArrayBuffer()

    const fileReader = new FileReader()

    fileReader.onload = function (e) {
      console.log('read chunk nr', currentChunk + 1, 'of')

      const chunk = e.target?.result
      if (chunk && typeof chunk !== 'string') {
        spard.append(chunk)
      }
      currentChunk++
      if (currentChunk < chunks) {
        loadNext()
      } else {
        const fileHash = spard.end()
        resolve({ fileHash, fileReader })
      }
    }

    fileReader.onerror = function (e) {
      reject()
    }

    function loadNext() {
      const start = currentChunk * defaultChunkSize
      const end = ((start + defaultChunkSize) >= file.size) ? file.size : start + defaultChunkSize
      const chunk = blobSlice.call(file, start, end)
      fileReader.readAsArrayBuffer(chunk)
    }

    loadNext()
  })
}
