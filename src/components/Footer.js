import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div>
        &copy; {new Date().getFullYear()} Shubha's Portfolio &nbsp;|&nbsp;
        <a href="mailto:hrarpitha@gmail.com">shubhavc18@gmail.com</a>
      </div>
      <div>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a> &nbsp;|&nbsp;
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>
    </footer>
  );
}

export default Footer;
