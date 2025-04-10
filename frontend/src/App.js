import React from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AnalyzePage from "./components/AnalyzePage"; // Import the new AnalyzePage component
import AboutUs from "./components/AboutUs";
import ResultsPage from "./components/ResultsPage";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/about-us" element={<AboutUs />} /> {/* About Us route */}
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
