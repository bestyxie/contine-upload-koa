import React from 'react';
import logo from './logo.svg';
import axios from 'axios';
import { splitFile } from './split-file'
import './App.css';

function App() {
  const checkFile = async (fileName: string, fileMd5Value: string) => {
    try {
      const res = await axios.get('http://localhost:8000/check', {
        params: {
          fileName,
          fileMd5Value,
        }
      })
      if (res.data.file) {
        return true
      }
      if (res.data.chunkList) {
        return res.data.chunkList
      }
      return []
    } catch (e) {
      console.log(e)
      return false
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData()
    formData.append('file', e.target.files?.[0] ?? '')
    const file = e.target.files?.[0]
    if (!file) return
    const defaultChunkSize = 1024
    const { fileHash } = await splitFile(file, defaultChunkSize)
    const checkResult = await checkFile(file.name, fileHash)
    if (typeof checkResult === 'boolean') {
      if (checkResult) {
        alert('上传成功')
        return
      }
      return
    }
    const requestList = []
    const chunkCount = file.size / defaultChunkSize
    for (let i = 0; i< chunkCount; i++) {
      if (!checkResult.includes(i)) {
        const form = new FormData()
        form.append('file', file.slice(i*defaultChunkSize))
        form.append('total', chunkCount.toString())
        form.append('index', i.toString())
        form.append('fileMd5Value', fileHash)
        requestList.push(axios.post('http://localhost:8000/upload', form))
      }
    }
    await Promise.all(requestList)
    const a = await axios.get('http://localhost:8000/merge', {
      params: {
        fileName: file.name,
        fileMd5Value: fileHash,
      },
    })
    alert('上传成功')
    console.log(a)
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
