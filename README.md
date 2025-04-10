# Sentanal: An AI-Powered Tool for Identifying Signs of Depression in User Tweets
_Sentanal_ is an X/Twitter sentiment analysis tool that detects signs of depression in text-based user tweets by leveraging pre-trained models from **Hugging Face** and **OpenAI's ChatGPT** LLM to classify the level of depression in user tweets and assist in enabling early intervention.

## Models and References

**This application uses the following pre-trained models for depression analysis and emotion classification:**

### Depression Analysis Model

- **Model**: [DeProBERTa (rafalposwiata/deproberta-large-depression)](https://huggingface.co/rafalposwiata/deproberta-large-depression)
- **Description**: Fine-tuned RoBERTa model for detecting depression severity in text content
- **Developed by**: rafalposwiata on Hugging Face (https://huggingface.co/rafalposwiata)
- **Citation**: @inproceedings{poswiata-perelkiewicz-2022-opi,
  title = "{OPI}@{LT}-{EDI}-{ACL}2022: Detecting Signs of Depression from Social Media Text using {R}o{BERT}a Pre-trained Language Models",
  author = "Po{\'s}wiata, Rafa{\l} and Pere{\l}kiewicz, Micha{\l}",
  booktitle = "Proceedings of the Second Workshop on Language Technology for Equality, Diversity and Inclusion",
  month = may,
  year = "2022",
  address = "Dublin, Ireland",
  publisher = "Association for Computational Linguistics",
  url = "https://aclanthology.org/2022.ltedi-1.40",
  doi = "10.18653/v1/2022.ltedi-1.40",
  pages = "276--282",
  }

### Emotion Classification Model

- **Model**: [twitter-roberta-base-sentiment-latest](https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest)
- **Description**: RoBERTa-based model trained on tweets for sentiment classification
- **Developed by**: cardiffnlp on Hugging Face (https://huggingface.co/cardiffnlp)
