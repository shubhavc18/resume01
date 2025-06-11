import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResumeUpload.css';

function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeExists, setResumeExists] = useState(false);
  const [uploadDate, setUploadDate] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkResumeStatus();
  }, []);

  const checkResumeStatus = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resume-status');
      setResumeExists(response.data.exists);
      setUploadDate(response.data.uploadDate);
    } catch (error) {
      console.error('Error checking resume status:', error);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setMessage('');
    } else {
      setMessage('Please select a PDF file only');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await axios.post('http://localhost:5000/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage('Resume uploaded successfully!');
      setFile(null);
      checkResumeStatus();
      
      // Reset file input
      document.getElementById('resume-input').value = '';
      
    } catch (error) {
      setMessage(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/download-resume', {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'shubha-Resume.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      setMessage('Download failed. Resume not found.');
    }
  };

  return (
    <div className="resume-upload-container">
      <h3>Resume Management</h3>
      
      {resumeExists && (
        <div className="resume-status">
          <p>✅ Resume uploaded on: {new Date(uploadDate).toLocaleDateString()}</p>
          <button onClick={handleDownload} className="download-btn">
            Download Current Resume
          </button>
        </div>
      )}

      <div className="upload-section">
        <input
          id="resume-input"
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="file-input"
        />
        
        {file && (
          <p className="file-selected">Selected: {file.name}</p>
        )}
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : resumeExists ? 'Replace Resume' : 'Upload Resume'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
