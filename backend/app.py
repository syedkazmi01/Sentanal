import tweepy
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import openai
from flask_cors import CORS
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialise Flask application with CORS support for cross-origin requests
app = Flask(__name__)
CORS(app)

# Load the new depression classifier model (DeProBERTa) - This model is specifically trained to detect level of depression in user tweets - Categories: Severe, Moderate, or Not depression
tokenizer = AutoTokenizer.from_pretrained("rafalposwiata/deproberta-large-depression")
model = AutoModelForSequenceClassification.from_pretrained("rafalposwiata/deproberta-large-depression")

# Create a pipeline for the new model
depression_classifier = pipeline("text-classification", model=model, tokenizer=tokenizer)

# Set up the sentiment analysis model path
model_path = "cardiffnlp/twitter-roberta-base-sentiment-latest"

# Initialise the sentiment analysis pipeline to detect emotions in user tweets
sentiment_task = pipeline("sentiment-analysis", model=model_path, tokenizer=model_path)

# Twitter API Bearer Token (to be filled in)
BEARER_TOKEN = ""

@app.route('/analyze', methods=['POST'])
def analyze_tweets():
    """
      Main endpoint to analyze a user's tweets for depression signs and emotional content.
      Takes an X/Twitter username and optional pagination token.
      Returns analysis results for up to 5 tweets.
      """
    data = request.json
    username = data.get("username")
    num_tweets = 5  # Always set to 5 tweets
    pagination_token = data.get("pagination_token")

    logger.info(f"Received request to analyze tweets for username: {username}")

    # Validates that the username is in the specified format, error handling is incorporated
    if not username or not re.match(r"^[A-Za-z0-9_]{1,15}$", username):
        logger.error("Invalid username format.")
        return jsonify({
            "error": "Invalid username. It must be 1-15 characters long and contain only letters, numbers, or underscores."}), 400
    try:
        # Initialise the X/Twitter API client
        client = tweepy.Client(bearer_token=BEARER_TOKEN)

        # Get profile information using the username
        user = client.get_user(username=username)

        if not user or not user.data:
            logger.warning(f"User '{username}' not found.")
            return jsonify({"error": "User not found"}), 404

        user_id = user.data.id
        logger.info(f"User ID for '{username}': {user_id}")

        # Fetch the tweets using pagination
        tweets = client.get_users_tweets(
            id=user_id,
            max_results=num_tweets,
            pagination_token=pagination_token,
            tweet_fields=["text", "referenced_tweets"],
            expansions=["referenced_tweets.id", "referenced_tweets.id.author_id"],
        )

        if not tweets or not tweets.data:
            logger.warning(f"No tweets found for user '{username}'.")
            return jsonify({"error": "No more tweets found."}), 404

        logger.info(f"Fetched {len(tweets.data)} tweets for '{username}'.")

        results = []
        user_may_show_depression = False

        # Analyse each tweet for signs of depression and emotion classification
        for tweet in tweets.data:
            logger.info(f"Analyzing tweet: {tweet.text}")

            # Classify level of depression
            depression_res = depression_classifier(tweet.text)
            depression_label = depression_res[0]["label"].capitalize()
            depression_score = round(depression_res[0]["score"] * 100, 2)

            # Classify emotion
            emotion_res = sentiment_task(tweet.text)
            emotion_label = emotion_res[0]["label"].capitalize()

            # Store the analysis results
            results.append({
                "text": tweet.text,
                "emotion": emotion_label,
                "analysis": depression_label,
                "confidence_score": f"{depression_score}%"
            })

            # Flag user if moderate or severe signs are detected in user tweets
            if depression_label in ["Moderate", "Severe"]:
                user_may_show_depression = True

        # This is the analysis message displayed under the 'Analysis Results' heading on the front end
        message = "The user shows signs of depression." if user_may_show_depression else "No signs of depression detected."

        # Log the message that will be sent to the frontend
        logger.info(f"Message for the user: {message}")

        # Get pagination token for loading more tweets
        next_pagination_token = tweets.meta.get("next_token")

        # Return the analysis results along with the message
        return jsonify({
            "username": username,
            "message": message,
            "results": results,
            "pagination_token": next_pagination_token
        })

    except Exception as e:
        logger.error(f"Error in analyze_tweets: {str(e)}", exc_info=True)
        return jsonify({"error": f"Error fetching tweets: {str(e)}"}), 500

@app.route('/chatgpt-analysis', methods=['POST'])
def chatgpt_analysis():
    """
        Endpoint to provide a more detailed analysis of tweets using ChatGPT.
        Takes previously analysed tweets (by the depression analysis and emotion classification model) and analyses them.
        Returns a comprehensive psychological analysis.
    """
    data = request.json
    tweet_data = data.get("tweet_data", [])

    if not tweet_data:
        logger.error("No tweet data provided.")
        return jsonify({"error": "No tweet data provided"}), 400

    # Write a comprehensive prompt to be passed on to ChatGPT for depression analysis.
    prompt = (
            "Below are tweets analysed for emotion and depression risk:\n\n"
            + ''.join([
        f"Tweet: {tweet['text']}\n"
        f"Emotion: {tweet['emotion']}\n"
        f"Depression Analysis: {tweet['analysis']}\n"
        f"Confidence Score: {tweet['confidence_score']}\n\n"
        for tweet in tweet_data
    ])
            + "\n\nPlease analyse **each** tweet thoroughly, ensuring none are omitted. The analysis must be written in **British English**, "
              "using British spelling and phrasing consistently.\n\n"

              "For **each** tweet, provide:\n\n"

              "### **Depression Severity Classification**\n"
              "- **Classification**: Categorise as **Shows Signs of Severe Depression, Shows Signs of Moderate Depression, or Does Not Show Signs of Depression**.\n"
              "- **Justification**: Explain why the tweet falls under this category.\n\n"

              "### **Final Summary**\n"
              "- **Overall Emotional State**: Summarise the user’s general emotional tone based on all tweets.\n"
              "- **Depression Risk Assessment**: Identify patterns in depressive signs and provide an overall risk level.\n"
              "- **Key Observations**:\n"
              "  - Recurring emotions or themes across tweets\n"
              "  - Any noticeable trends in worsening or improving emotional state\n"
              "  - Any need for concern or urgent intervention\n\n"

              "Ensure that the structure remains **consistent** for each request, following the format outlined above. "
              "Do not omit any tweets, and maintain coherence and clarity throughout the analysis. If the tweet is a retweet (RT), mention that it is a retweet and not something posted by the user so analysing depression is difficult."
    )

    try:
        # Add OpenAI API key
        openai.api_key = ""

        # Call the ChatGPT API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "system",
                       "content": "You are a helpful assistant with expertise in psychology and AI analysis."},
                      {"role": "user", "content": prompt}]
        )

        content = response['choices'][0]['message']['content']

        # Log the response from ChatGPT for troubleshooting
        logger.info(f"ChatGPT response: {content}")

        return jsonify({
            "response": content,
        })

    except Exception as e:
        logger.error(f"Error in chatgpt_analysis: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


@app.route('/fetch-profile', methods=['GET'])
def fetch_profile():
    """
        Endpoint to fetch a user's X/Twitter profile information.
        Takes a username query parameter and returns profile details.
    """
    username = request.args.get("username")

    if not username:
        logger.error("Username is required.")
        return jsonify({"error": "Username is required"}), 400

    try:

        # Initialise the X/Twitter API Client
        client = tweepy.Client(bearer_token=BEARER_TOKEN)

        # Get user profile with specific fields
        user = client.get_user(username=username, user_fields=["created_at", "public_metrics", "description"])

        if not user or not user.data:
            logger.warning(f"User '{username}' not found.")
            return jsonify({"error": "User not found"}), 404

        user_data = user.data
        created_at = user_data.created_at.isoformat() if user_data.created_at else "Unknown"

        # Specify the format for the profile information
        profile_info = {
            "username": user_data.username,
            "bio": user_data.description or "No bio available.",
            "followers_count": user_data.public_metrics["followers_count"],
            "following_count": user_data.public_metrics["following_count"],
            "created_at": created_at,
        }

        return jsonify(profile_info)

    except tweepy.errors.TooManyRequests:
        logger.error("Rate limit exceeded.")
        return jsonify({"error": "Rate limit exceeded. Try again later."}), 429

    except tweepy.errors.Unauthorized:
        logger.error("Invalid or expired bearer token.")
        return jsonify({"error": "Invalid or expired bearer token."}), 401

    except Exception as e:
        logger.error(f"Error in fetch_profile: {str(e)}", exc_info=True)
        return jsonify({"error": "An unexpected error occurred"}), 500

@app.route('/load-more-tweets', methods=['POST'])
def load_more_tweets():
    """
        Endpoint to load more tweets for the user.
        Takes a username and pagination token to fetch the next set of tweets.
        Returns analysis results for up to 5 more tweets.
     """
    data = request.json
    username = data.get("username")
    num_tweets = 5
    pagination_token = data.get("pagination_token", None)

    if not username:
        logger.error("Username is required.")
        return jsonify({"error": "Username is required"}), 400

    try:
        # Initialise the X/Twitter API client
        client = tweepy.Client(bearer_token=BEARER_TOKEN)

        # Get user information
        user = client.get_user(username=username)
        user_id = user.data.id

        # Fetch the next batch of tweets
        tweets = client.get_users_tweets(
            id=user_id,
            max_results=num_tweets,
            tweet_fields=["text"],
            pagination_token=pagination_token,
        )
        logger.info(f"Requested {num_tweets} tweets, but fetched {len(tweets.data)} tweets.")

        if not tweets or not tweets.data:
            logger.warning(f"No more tweets found for user '{username}'.")
            return jsonify({"error": "No more tweets found."}), 404

        logger.info(f"Fetched {len(tweets.data)} more tweets for '{username}'.")

        results = []
        # Analyse each additional tweet
        for tweet in tweets.data:
            depression_res = depression_classifier(tweet.text)
            depression_label = depression_res[0]["label"].capitalize()
            depression_score = round(depression_res[0]["score"] * 100, 2)

            emotion_res = sentiment_task(tweet.text)
            emotion_label = emotion_res[0]["label"].capitalize()

            results.append({
                "text": tweet.text,
                "emotion": emotion_label,
                "analysis": depression_label,
                "confidence_score": f"{depression_score}%"
            })

        next_pagination_token = tweets.meta.get("next_token")

        return jsonify({
            "results": results,
            "pagination_token": next_pagination_token
        })

    except Exception as e:
        logger.error(f"Error in load_more_tweets: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    # Run the Flask application in debug mode
    app.run(debug=True)