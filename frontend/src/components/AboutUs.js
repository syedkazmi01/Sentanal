import React from "react";
import "../styles/AboutUs.css";

function AboutUs() {
  return (
    <div className="about-us-page">
      <h1 className="about-us-heading">sentanal.</h1>
      <hr className="design-line" />
      <div className="about-us-content">
        <div className="section">
          <h3 className="heading-1">What?</h3>
          <p className="paragraph-1">
            <span className="sentanal">sentanal.</span> is a pioneering
            X/Twitter sentiment analysis tool designed to assess the emotional
            well-being of users based on their tweets. Our tool analyses text
            data from a collection of tweets to determine whether the user is
            expressing signs of depression. By identifying signs of emotional or
            psychological distress, <span className="sentanal">sentanal.</span>{" "}
            plays a pivotal role in early detection, providing an opportunity
            for timely intervention.
          </p>
        </div>

        <div className="section">
          <hr className="design-line" />
          <h3 className="heading-2">Why?</h3>
          <p className="paragraph-2">
            We believe in the power of technology to make a difference at{" "}
            <span className="sentanal">sentanal.</span> Our mission is to
            support vulnerable individuals on social media by offering early
            detection of emotional distress, making early intervention possible.
            Our tool is built to empower those who might otherwise go unnoticed,
            giving them the opportunity to receive the support they deserve.
          </p>
        </div>

        <div className="section">
          <hr className="design-line" />
          <h3 className="heading-3">How?</h3>
          <p className="paragraph-3">
            In a world where social media is a powerful tool for communication,
            it can also serve as an important indicator of mental health.{" "}
            <span className="sentanal">sentanal.</span> leverages advanced
            Artificial Intelligence (AI) and Machine Learning (ML) techniques to
            analyse tweets, classifying them as{" "}
            <span className="classification">showing moderate, severe,</span> or{" "}
            <span className="classification">no signs of depression</span>.
          </p>
        </div>

        <div className="contact-us">
          <hr className="design-line" />
          <h3 className="heading-4">Got Questions?</h3>
          <br></br>
          <p className="p-1">
            Email us at{" "}
            <a
              className="contact-email"
              href="mailto:contact@sentanal.org?subject=Query&body=I would like to get in touch!"
            >
              contact@sentanal.org
            </a>
            <span>.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
