import React from "react";
import Skills from "../components/Skills";
import ResumeUpload from "../components/ResumeUpload";
import "./About.css";

function About() {
  const handleDownloadResume = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/download-resume');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'shubha-Resume.pdf';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Resume not available for download');
      }
    } catch (error) {
      alert('Download failed');
    }
  };

  return (
    <div className="about-container">
      <div className="about-card">
        <h3>Contact</h3>
        <p>Email: shubhavc18@gmail.com</p>
        <div className="about-links">
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
        </div>
        <button onClick={handleDownloadResume} className="cv-btn">
          Download My CV
        </button>
      </div>
      
      <div className="about-card">
        <h3>Hi, I'm Shubha!</h3>
        <p>
          I'm a passionate Computer Science and Engineering student with a keen interest in frontend development and a love for learning new technologies. My curiosity drives me to experiment and continuously improve my skills.
        </p>
        <h4>Background</h4>
        <p>
          I am currently pursuing my Bachelor's degree in Computer Science and Engineering.
        </p>
      </div>
      
      <Skills />
      
      {/* Admin section for resume management */}
      <div className="about-card">
      </div>
    </div>
  );
}

export default About;
