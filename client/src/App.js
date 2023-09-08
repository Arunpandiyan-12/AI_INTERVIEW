import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      alert('Please select a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      await axios.post('http://localhost:5000/extract', formData);
  
      setUploadSuccess(true);
  
      setUploadError('');
    } catch (error) {
      console.error('Error uploading file:', error);
    
      setUploadError(error.message);
      
      setUploadSuccess(false);
    }
  };

  const toggleSpeechRecognition = () => {
    if (!isListening) {
      startSpeechRecognition();
    } else {
      stopSpeechRecognition();
    }
    setIsListening(!isListening);
  };

  const startSpeechRecognition = () => {
    const recognition = new window.webkitSpeechRecognition();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('Speech Recognition Result:', transcript);
      sendTranscriptToServer(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
    };

    recognition.onend = () => {
      console.log('Speech Recognition Ended');
    };

    recognition.start();
  };

  const stopSpeechRecognition = () => {
    console.log('Stopping Speech Recognition');
  };

  const sendTranscriptToServer = async (transcript) => {
    try {
      await axios.post('http://localhost:5000/store-transcript', { transcript });
      console.log('Transcript sent to server and stored in the database.');
    } catch (error) {
      console.error('Error sending transcript to server:', error);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Oral Exam System</h1>

      <div className="upload-container">
        <label htmlFor="pdf-upload" className="custom-upload-btn">
          Select PDF File
        </label>
        <input
          type="file"
          accept=".pdf"
          id="pdf-upload"
          onChange={handleFileChange}
        />
        <button onClick={uploadFile} className="upload-btn">
          Upload PDF
        </button>
        {uploadSuccess && <p className="upload-success">Upload Successful!</p>}
        {uploadError && <p className="upload-error">{uploadError}</p>}
      </div>

      <button onClick={toggleSpeechRecognition} className={`mic-btn ${isListening ? 'listening' : ''}`}>
        <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'}`}></i> {/* Microphone icon */}
        {isListening ? 'Stop Speaking' : 'Start Speaking'}
      </button>
    </div>
  );
}

export default App;
