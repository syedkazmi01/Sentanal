import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/ResultsPage.css";
import ReactMarkdown from "react-markdown";

/**
 * ResultsPage Component
 *
 * This component displays and manages the Twitter analysis results.
 * It shows tweet-by-tweet analysis, user profile information, and provides
 * a way to request more detailed analysis via the ChatGPT API integration.
 */
function ResultsPage() {
  const location = useLocation();
  const initialResults = location.state;
  const [chatGPTResponse, setChatGPTResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profileInfo, setProfileInfo] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [tweets, setTweets] = useState(initialResults?.results || []);
  const [loadedAllTweets, setLoadedAllTweets] = useState(false);
  const [paginationToken, setPaginationToken] = useState(
    initialResults?.pagination_token || null
  );

  // Store the overall analysis depression message
  const [analysisMessage, setAnalysisMessage] = useState(
    initialResults?.message || "Analysis pending..."
  );

  // Determines confidence level label and color based on the numerical score
  const getConfidenceLevel = (score) => {
    if (score >= 80) return { level: "High Confidence", color: "green" };
    if (score >= 50) return { level: "Medium Confidence", color: "amber" };
    return { level: "Low Confidence", color: "red" };
  };

  /**
   * Handles sending tweet data to the backend for advanced analysis via ChatGPT API
   * Processes the current set of tweets and sends them to the API
   */
  const handleChatGPTAnalysis = async () => {
    if (!tweets || tweets.length === 0) return;

    setLoading(true);
    setError(null);
    setChatGPTResponse(null);

    // Format the tweet data for the API request
    const tweetData = tweets.map((tweet) => ({
      text: tweet.text,
      emotion: tweet.emotion,
      analysis: tweet.analysis,
      confidence_score: tweet.confidence_score,
    }));

    try {
      // API call to get the in-depth analysis of the tweets from ChatGPT
      const response = await axios.post(
        "http://localhost:5000/chatgpt-analysis",
        { tweet_data: tweetData }
      );

      setChatGPTResponse(response.data.response);
    } catch (err) {
      // Error handling
      setError("Failed to fetch analysis. Please try again.");
      console.error("ChatGPT analysis error:", err);
    }

    setLoading(false);
  };

  // Loads additional tweets for the user
  const loadMoreTweets = async () => {
    if (!paginationToken || loadedAllTweets) return;

    setLoading(true);
    setError(null);

    try {
      // API call to retrieve more tweets
      const response = await axios.post(
        "http://localhost:5000/load-more-tweets",
        {
          username: initialResults.username,
          num_tweets: 10,
          pagination_token: paginationToken,
        }
      );

      // Check if the end of tweets has been reached
      if (response.data.results.length === 0) {
        setLoadedAllTweets(true);
      } else {
        // Store new tweets
        const newTweets = response.data.results;
        // Append new ones to the existing ones
        setTweets((prevTweets) => [...prevTweets, ...newTweets]);
        setPaginationToken(response.data.pagination_token || null);

        // Check if any of the new tweets show signs of depression
        const hasDepressionSigns = newTweets.some(
          (tweet) => tweet.analysis === "Shows signs of depression"
        );

        // Update the message if depression signs are found and not already detected
        if (
          hasDepressionSigns &&
          analysisMessage !== "The user shows signs of depression."
        ) {
          setAnalysisMessage("The user shows signs of depression.");
        }
      }
    } catch (err) {
      setError("Failed to load more tweets. Please try again.");
      console.error("Load more tweets error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    /**
     * If no message is provided in the initial results but we have tweets,
     * calculate the initial depression status
     */
    if (
      (!initialResults?.message || initialResults.message === "") &&
      tweets.length > 0
    ) {
      // Check if any tweets show signs of depression
      const hasDepressionSigns = tweets.some(
        (tweet) => tweet.analysis === "Shows signs of depression"
      );

      setAnalysisMessage(
        hasDepressionSigns
          ? "The user shows signs of depression."
          : "No signs of depression detected."
      );
    }
  }, [initialResults?.message, tweets]);

  useEffect(() => {
    // Exit if no username is available
    if (!initialResults?.username) return;

    // Fetch profile information
    axios
      .get(
        `http://localhost:5000/fetch-profile?username=${initialResults.username}`
      )
      .then((response) => {
        setProfileInfo(response.data);
      })
      .catch((err) => {
        setProfileError("Failed to load profile information.");
        console.error("Profile fetch error:", err);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [initialResults?.username]);

  return (
    <div className="results-page">
      <h1 className="h-1">Analysis Results</h1>
      <div className="header">
        <p className="analysis-message">{analysisMessage}</p>
      </div>

      {/* User profile section */}
      <div className="bio-container">
        {initialResults && initialResults.username && (
          <p className="username">
            <a
              href={`https://x.com/${initialResults.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="user"
            >
              @{initialResults.username}
            </a>{" "}
            on X/Twitter
          </p>
        )}

        {/* Profile information container */}
        <div className="profile-info-container">
          {loadingProfile && (
            <p className="loading-message">Loading profile info...</p>
          )}
          {profileError && <p className="error-message">{profileError}</p>}

          {/* Profile details once available */}
          {profileInfo && (
            <div className="profile-details">
              <p>
                <strong className="bold-elements">Bio:</strong>{" "}
                {profileInfo.bio || "No bio available."}
              </p>
              <p>
                <strong className="bold-elements">Followers:</strong>{" "}
                {profileInfo.followers_count}
              </p>
              <p>
                <strong className="bold-elements">Following:</strong>{" "}
                {profileInfo.following_count}
              </p>
              <p>
                <strong className="bold-elements">Joined:</strong>{" "}
                {new Date(profileInfo.created_at).toDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ChatGPT analysis button */}
      <div className="chatgpt-button-container">
        <button
          className={`chatgpt-button ${loading ? "no-arrow" : ""}`}
          onClick={handleChatGPTAnalysis}
          disabled={loading}
        >
          {loading ? "Analysing..." : "Sentanal InDepth Analysis Tool"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* ChatGPT's in-depth analysis result */}
      {chatGPTResponse && (
        <div className="chatgpt-response">
          <h3>Sentanal's InDepth Analysis</h3>
          <ReactMarkdown>{chatGPTResponse}</ReactMarkdown>
        </div>
      )}

      {/* Tweet analysis section */}
      <h3 className="h-3">Tweet by Tweet Analysis</h3>
      {tweets.length > 0 ? (
        <div className="tweets-container">
          {tweets.map((tweet, index) => {
            // Parse the confidence score string (removing '%' and converting to number)
            const confidenceScore = parseFloat(tweet.confidence_score);
            const { level, color } = getConfidenceLevel(confidenceScore);

            return (
              <div className="tweet-card" key={index}>
                <p>
                  <strong className="bold-elements">Tweet:</strong> {tweet.text}
                </p>
                <br></br>
                <p>
                  <strong className="bold-elements">
                    Depression Analysis:
                  </strong>{" "}
                  {tweet.analysis}
                  <div className="info-icon">
                    i
                    <span className="tooltip-text">
                      Depression analysis based on tweet content. Categories:
                      "Moderate", "Severe" or "Does not show signs of
                      depression".
                    </span>
                  </div>
                </p>

                {/* Confidence score alongside the indicator */}
                <p>
                  <strong className="bold-elements">
                    Confidence Score of Depression Analysis Model:
                  </strong>{" "}
                  {confidenceScore.toFixed(2)}%
                  <div className="info-icon">
                    i
                    <span className="tooltip-text">
                      This is the confidence level of the AI model's analysis.
                      Classes: "High", "Medium", or "Low".
                    </span>
                  </div>
                  <div className="confidence-bar-container">
                    <span className="confidence-level">{level}</span>
                    <div className={`confidence-bar ${color}`}></div>
                  </div>
                </p>
                <br></br>
                <p>
                  <strong className="bold-elements">
                    Emotion Classification:
                  </strong>{" "}
                  {tweet.emotion}
                  <div className="info-icon">
                    i
                    <span className="tooltip-text">
                      Sentiment detected in the tweet by the AI model.
                      Categories: "Positive", "Negative", or "Neutral".
                    </span>
                  </div>
                </p>
              </div>
            );
          })}

          {!loadedAllTweets && (
            <div className="load-more-container">
              <button
                className={`chatgpt-button ${loading ? "no-arrow" : ""}`}
                onClick={loadMoreTweets}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More Tweets"}
              </button>
            </div>
          )}

          {/* Disclaimer about the tool's accuracy */}
          <div>
            <p className="analysis-disclaimer">
              Our app may <b>NOT</b> be 100% accurate, please use the InDepth
              Analysis Tool, analyse the tweet content yourself, take the
              context into consideration, and use your expert knowledge (if you
              are a mental health professional), if not, reach out to a mental
              health professional.
            </p>
          </div>
        </div>
      ) : (
        <p className="error-message">No results available to display.</p>
      )}
    </div>
  );
}

export default ResultsPage;
