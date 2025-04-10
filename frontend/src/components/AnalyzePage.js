import "../styles/AnalyzePage.css"; // Retain the current styling
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * AnalyzePage Component
 *
 * This component provides the interface for users to enter an X/Twitter handle
 * and submit it for analysis. It handles form submission, validation, and
 * API communication with the backend server.
 */
function AnalyzePage() {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Handles form submission
  const handleInputChange = (event) => {
    setInputValue(event.target.value); // Update input value
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Validate if the input field is empty
    if (inputValue.trim() === "") {
      setErrorMessage("Please enter a value before submitting.");
    } else {
      setErrorMessage("");

      try {
        // Make API call to backend to analyse the tweets
        const response = await axios.post("http://127.0.0.1:5000/analyze", {
          username: inputValue,
          num_tweets: 5,
        });

        // Navigate to results page with the response data
        navigate("/results", {
          state: { ...response.data, username: inputValue },
        });
      } catch (error) {
        // Use the error message from the API response if available, otherwise use generic message
        setErrorMessage(error.response?.data?.error || "Something went wrong.");
      }
    }
  };

  return (
    <div className="analyze-page">
      <h1 className="analyze-heading">Start Analysing Tweets.</h1>

      {/* X/Twitter handle submission form */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          spellCheck="false"
          placeholder="Enter Twitter Handle"
          value={inputValue}
          onChange={handleInputChange}
        />

        {/* Error message displayed when required */}
        <p className={`error-message ${errorMessage ? "visible" : ""}`}>
          {errorMessage}
        </p>
        <button className="submit-button" type="submit">
          Analyse
        </button>
      </form>
    </div>
  );
}

export default AnalyzePage;
