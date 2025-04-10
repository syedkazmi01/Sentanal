import React from "react";
import "../styles/HeroSection.css"; // Import the CSS for this component
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function HeroSection() {
  return (
    <div className="hero-section">
      <div className="logo-container">
        <img src={logo} alt="Logo" className="center-logo" />
      </div>
      <div className="tagline-container">
        <p className="tagline">A X/Twitter Sentiment Analysis Tool.</p>
      </div>
      <div className="button-container">
        <Link to="/analyze">
          <button className="start-analyzing-button">Start Analysing</button>
        </Link>
      </div>
    </div>
  );
}

export default HeroSection;
