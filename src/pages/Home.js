import React from "react";
import "./Home.css";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="home-main">
      <div className="home-hero">
        <h2 className="home-welcome">Hi!! Welcome to my portfolio!!</h2>
        <h1 className="home-title">
          I am <span className="home-highlight">shubha!!</span>
        </h1>
        <h3 className="home-subtitle">
          I am a passionate <span className="home-highlight">frontend developer..</span>
        </h3>
        <button className="home-loadmore">Load more</button>
      </div>
      <Footer />
    </div>
  );
}

export default Home;
