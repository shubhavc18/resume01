const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/portfolio', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Resume Schema
const resumeSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    required: true
  },
  contentType: {
    type: String,
    required: true
  }
});

const Resume = mongoose.model('Resume', resumeSchema);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Routes

// Check if resume exists
app.get('/api/resume-status', async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadDate: -1 });
    
    if (resume) {
      res.json({
        exists: true,
        uploadDate: resume.uploadDate,
        filename: resume.originalName,
        fileSize: resume.fileSize
      });
    } else {
      res.json({
        exists: false
      });
    }
  } catch (error) {
    console.error('Error checking resume status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload resume
app.post('/api/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Delete previous resume if exists
    const existingResume = await Resume.findOne();
    if (existingResume) {
      // Delete old file from filesystem
      const oldFilePath = path.join(__dirname, existingResume.filePath);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      // Delete old record from database
      await Resume.deleteOne({ _id: existingResume._id });
    }

    // Save new resume info to database
    const newResume = new Resume({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      contentType: req.file.mimetype
    });

    await newResume.save();

    res.json({
      message: 'Resume uploaded successfully',
      filename: req.file.originalname,
      uploadDate: newResume.uploadDate
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download resume
app.get('/api/download-resume', async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadDate: -1 });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filePath = path.join(__dirname, resume.filePath);
    
    // Check if file exists on filesystem
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Resume file not found on server' });
    }

    // Set headers for file download
    res.setHeader('Content-Type', resume.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    res.setHeader('Content-Length', resume.fileSize);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error downloading file' });
      }
    });

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete resume (optional - for admin use)
app.delete('/api/delete-resume', async (req, res) => {
  try {
    const resume = await Resume.findOne();
    
    if (!resume) {
      return res.status(404).json({ error: 'No resume found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, resume.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await Resume.deleteOne({ _id: resume._id });

    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Get resume info (without downloading)
app.get('/api/resume-info', async (req, res) => {
  try {
    const resume = await Resume.findOne().sort({ uploadDate: -1 });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      filename: resume.originalName,
      uploadDate: resume.uploadDate,
      fileSize: resume.fileSize,
      id: resume._id
    });

  } catch (error) {
    console.error('Error getting resume info:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  
  if (error.message === 'Only PDF files are allowed!') {
    return res.status(400).json({ error: 'Only PDF files are allowed!' });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;