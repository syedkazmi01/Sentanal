import React from "react";
import logo from "../assets/logo.png"; // Import the logo from the assets folder
import "../styles/Navbar.css"; // Import the CSS for Navbar
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="/" className="logo-link">
          <img src={logo} alt="Logo" />
        </a>
      </div>
      <ul className="nav-links">
        <li>
          <Link className="home" to="/">
            Home
          </Link>
        </li>
        <li>
          <Link className="about" to="/about-us">
            About Us
          </Link>
        </li>{" "}
        {/* Link to About Us page */}
      </ul>
    </nav>
  );
}

export default Navbar;
