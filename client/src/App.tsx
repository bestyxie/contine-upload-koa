import React from 'react';
import logo from './logo.svg';
import axios from 'axios';
import { splitFile } from './split-file'
import './App.css';

function App() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.files?.[0])
    const formData = new FormData()
    formData.append('file', e.target.files?.[0] ?? '')
    const file = e.target.files?.[0]
    if (!file) return
    const defaultChunkSize = 1024
    const { fileHash, fileReader } = await splitFile(file, defaultChunkSize)
    console.log(fileHash)
    console.log(fileReader)
    const requestList = []
    const chunkCount = file.size / defaultChunkSize
    for (let i = 0; i< chunkCount; i++) {
      const form = new FormData()
      form.append('file', file.slice(i*defaultChunkSize))
      form.append('total', chunkCount.toString())
      form.append('index', i.toString())
      form.append('fileMd5Value', fileHash)
      requestList.push(axios.post('http://localhost:8000/upload', form))
    }
    const res = await Promise.all(requestList)
    // console.log(res)
    const a = await axios.get('http://localhost:8000/merge', {
      params: {
        fileName: file.name,
        fileMd5Value: fileHash,
      },
    })
    console.log(a)
    // try {
    //   const res = await axios.post('http://localhost:8000/upload', formData, {
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   })
    //   console.log(res)
    // } catch (e) {
    //   console.log('error: ', e)
    // }
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
