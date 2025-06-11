const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ResumeSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  data: Buffer,
});
const Resume = mongoose.model('Resume', ResumeSchema);

async function insertResume() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Remove old resume if exists
  await Resume.deleteMany({ filename: 'shubha-resume.pdf' });

  const filePath = path.join(__dirname, 'shubha-Resume.pdf'); // Place your PDF here
  const data = fs.readFileSync(filePath);

  const resume = new Resume({
    filename: 'shubha-resume.pdf',
    contentType: 'application/pdf',
    data,
  });

  await resume.save();
  console.log('Resume inserted!');
  mongoose.disconnect();
}

insertResume();
