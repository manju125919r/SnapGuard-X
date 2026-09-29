import React, { useState } from "react";

function EmailAnalyzer() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeEmail = async () => {
    if (!sender.trim() && !subject.trim() && !body.trim()) {
      setError("Please enter email content to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: sender.trim(),
            subject: subject.trim(),
            body: body.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Email analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to SnapGuard X backend."
      );
    } finally {
      setLoading(false);
    }
  };


  const clearEmail = () => {
    setSender("");
    setSubject("");
    setBody("");

    setResult(null);
    setError("");
  };


  const getRiskClass = (level) => {
    if (level === "HIGH") {
      return "risk-high";
    }

    if (level === "MEDIUM") {
      return "risk-medium";
    }

    return "risk-low";
  };


  const getIndicatorIcon = (type) => {
    if (type?.includes("urgency")) {
      return "⚠️";
    }

    if (type?.includes("sensitive")) {
      return "🔐";
    }

    if (type?.includes("link")) {
      return "🔗";
    }

    if (type?.includes("sender")) {
      return "👤";
    }

    return "🛡️";
  };


  return (
    <div className="analyzer-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="analyzer-header">

        <span className="section-label">
          AI SECURITY MODEL
        </span>

        <h1>
          Email Analyzer
        </h1>

        <p>
          Analyze suspicious emails and understand
          the evidence behind the security decision.
        </p>

      </div>


      {/* =====================================================
          MAIN EMAIL LAYOUT
      ===================================================== */}

      <div className="email-layout">


        {/* =================================================
            LEFT — EMAIL INPUT
        ================================================= */}

        <div className="analyzer-card email-input-card">

          <div className="card-title-row">

            <div className="card-title-icon">
              📧
            </div>

            <div>
              <h2>
                Email Details
              </h2>

              <p>
                Enter the email information you want
                SnapGuard X to analyze.
              </p>
            </div>

          </div>


          {/* SENDER */}

          <div className="input-group">

            <label htmlFor="email-sender">
              Sender
            </label>

            <input
              id="email-sender"
              type="email"
              value={sender}
              onChange={(e) =>
                setSender(e.target.value)
              }
              placeholder="example@company.com"
            />

          </div>


          {/* SUBJECT */}

          <div className="input-group">

            <label htmlFor="email-subject">
              Subject
            </label>

            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              placeholder="Your account requires verification"
            />

          </div>


          {/* BODY */}

          <div className="input-group">

            <label htmlFor="email-body">
              Email Body
            </label>

            <textarea
              id="email-body"
              value={body}
              onChange={(e) =>
                setBody(e.target.value)
              }
              placeholder="Paste the email content here..."
              rows="10"
            />

          </div>


          {/* BUTTONS */}

          <div className="email-actions">

            <button
              type="button"
              className={`analyze-button ${loading ? "is-loading" : ""}`}
              onClick={analyzeEmail}
              disabled={loading}
              aria-busy={loading}
            >
              <span className="analyze-button-icon" aria-hidden="true">
                {loading ? "⟳" : "🔍"}
              </span>

              <span className="analyze-button-text">
                {loading ? "Analyzing Email..." : "Analyze Email"}
              </span>

              {!loading && (
                <span className="analyze-button-arrow" aria-hidden="true">
                  →
                </span>
              )}
            </button>


            <button
              type="button"
              className="clear-button"
              onClick={clearEmail}
              disabled={loading}
            >
              Clear
            </button>

          </div>


          {/* ERROR */}

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

        </div>


        {/* =================================================
            RIGHT — ANALYSIS RESULT
        ================================================= */}

        <div className="analyzer-card result-card">

          <div className="card-title-row">

            <div className="card-title-icon result-icon">
              🛡️
            </div>

            <div>
              <h2>
                Security Analysis
              </h2>

              <p>
                SnapGuard X explains the signals behind
                the decision.
              </p>
            </div>

          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!result && !loading && (

            <div className="empty-result">

              <div className="empty-icon">
                📧
              </div>

              <h3>
                Waiting for analysis
              </h3>

              <p>
                Enter an email and SnapGuard X will
                analyze its security signals.
              </p>

            </div>

          )}


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="empty-result">

              <div className="empty-icon loading-icon">
                🤖
              </div>

              <h3>
                Analyzing email...
              </h3>

              <p>
                Rule engine and ONNX AI model are
                analyzing the email.
              </p>

            </div>

          )}


          {/* =================================================
              RESULTS
          ================================================= */}

          {result && (

            <div className="analysis-result">


              {/* ===========================================
                  RISK
              =========================================== */}

              <div
                className={`risk-card ${getRiskClass(
                  result.risk_level
                )}`}
              >

                <div>

                  <span className="result-label">
                    RISK LEVEL
                  </span>

                  <h3>
                    {result.risk_level}
                  </h3>

                  <p>
                    {result.verdict}
                  </p>

                </div>


                <div className="risk-score">

                  <strong>
                    {result.risk_score}
                  </strong>

                  <span>
                    /100
                  </span>

                </div>

              </div>


              {/* ===========================================
                  AI CLASSIFICATION
              =========================================== */}

              <div className="ai-card">

                <span className="result-label">
                  AI CLASSIFICATION
                </span>

                <div className="ai-main">

                  <strong>
                    {result.ai_prediction}
                  </strong>

                  <span>
                    {(result.ai_confidence * 100).toFixed(2)}
                    % confidence
                  </span>

                </div>


                <div className="model-status">

                  <span className="status-dot"></span>

                  {result.ai_status}

                </div>

              </div>


              {/* ===========================================
                  AI PROBABILITIES
              =========================================== */}

              {result.ai_probabilities && (

                <div className="probability-card">

                  <span className="result-label">
                    AI PROBABILITY BREAKDOWN
                  </span>


                  {Object.entries(
                    result.ai_probabilities
                  ).map(([label, value]) => (

                    <div
                      className="probability-row"
                      key={label}
                    >

                      <div className="probability-header">

                        <span>
                          {label}
                        </span>

                        <span>
                          {(value * 100).toFixed(2)}%
                        </span>

                      </div>


                      <div className="probability-bar">

                        <div
                          className="probability-fill"
                          style={{
                            width:
                              `${value * 100}%`,
                          }}
                        />

                      </div>

                    </div>

                  ))}

                </div>

              )}


              {/* ===========================================
                  SECURITY INDICATORS
              =========================================== */}

              <div className="indicators-card">

                <span className="result-label">
                  SECURITY INDICATORS
                </span>


                {result.indicators &&
                result.indicators.length > 0 ? (

                  result.indicators.map(
                    (indicator, index) => (

                      <div
                        className="indicator-item"
                        key={index}
                      >

                        <div className="indicator-icon">

                          {getIndicatorIcon(
                            indicator.type
                          )}

                        </div>


                        <div>

                          <strong>
                            {indicator.title}
                          </strong>

                          <p>
                            {indicator.description}
                          </p>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <p className="no-indicators">
                    No major security indicators
                    detected.
                  </p>

                )}

              </div>


              {/* ===========================================
                  DETECTED URLS
              =========================================== */}

              {result.detected_urls &&
              result.detected_urls.length > 0 && (

                <div className="urls-card">

                  <span className="result-label">
                    DETECTED LINKS
                  </span>


                  {result.detected_urls.map(
                    (url, index) => (

                      <div
                        className="detected-url"
                        key={index}
                      >
                        🔗 {url}
                      </div>

                    )
                  )}

                </div>

              )}


              {/* ===========================================
                  TRUST CHAIN
              =========================================== */}

              {result.trust_chain && (

                <div className="trust-chain">

                  <span className="result-label">
                    🔗 TRUST CHAIN
                  </span>


                  <div className="trust-step">

                    <span>1</span>

                    <div>

                      <strong>
                        DETECT
                      </strong>

                      <p>
                        {result.trust_chain.detect}
                      </p>

                    </div>

                  </div>


                  <div className="trust-step">

                    <span>2</span>

                    <div>

                      <strong>
                        CONNECT
                      </strong>

                      <p>
                        {result.trust_chain.connect}
                      </p>

                    </div>

                  </div>


                  <div className="trust-step">

                    <span>3</span>

                    <div>

                      <strong>
                        EXPLAIN
                      </strong>

                      <p>
                        {result.trust_chain.explain}
                      </p>

                    </div>

                  </div>


                  <div className="trust-step">

                    <span>4</span>

                    <div>

                      <strong>
                        PROTECT
                      </strong>

                      <p>
                        {result.trust_chain.protect}
                      </p>

                    </div>

                  </div>

                </div>

              )}


              {/* ===========================================
                  RECOMMENDATION
              =========================================== */}

              <div className="recommendation-card">

                <span className="result-label">
                  🛡️ RECOMMENDATION
                </span>

                <p>
                  {result.recommendation}
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default EmailAnalyzer;