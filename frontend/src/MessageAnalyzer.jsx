import React, { useState } from "react";

function MessageAnalyzer() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/analyze-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to connect to SnapGuard X backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAnalysis = () => {
    setMessage("");
    setResult(null);
    setError("");
  };

  const getRiskClass = (level) => {
    if (!level) return "risk-default";

    const value = level.toLowerCase();

    if (value === "high") return "risk-high";
    if (value === "medium") return "risk-medium";
    if (value === "low") return "risk-low";

    return "risk-default";
  };

  const getRiskIcon = (level) => {
    if (!level) return "🛡️";

    const value = level.toLowerCase();

    if (value === "high") return "🚨";
    if (value === "medium") return "⚠️";
    if (value === "low") return "✓";

    return "🛡️";
  };

  const formatConfidence = (confidence) => {
    if (confidence === undefined || confidence === null) {
      return "N/A";
    }

    return `${(Number(confidence) * 100).toFixed(2)}%`;
  };

  const getProbability = (probabilities, label) => {
    if (!probabilities) return 0;

    const value = probabilities[label];

    if (value === undefined || value === null) {
      return 0;
    }

    return Number(value) * 100;
  };

  return (
    <div className="analyzer-page">

      {/* =========================
          PAGE HEADER
      ========================= */}
      <div className="analyzer-header">
        <div>
          <div className="page-eyebrow">
            AI SECURITY ANALYSIS
          </div>

          <h1>Message Analyzer</h1>

          <p>
            Analyze suspicious messages before you trust, click,
            reply, or share information.
          </p>
        </div>

        <div className="analyzer-status">
          <span className="status-dot"></span>
          SnapGuard AI Online
        </div>
      </div>

      {/* =========================
          INPUT CARD
      ========================= */}
      <div className="analyzer-card message-input-card">

        <div className="card-heading">
          <div className="card-icon message-icon">
            💬
          </div>

          <div>
            <h2>Message Content</h2>
            <p>
              Paste the message you want SnapGuard X to inspect.
            </p>
          </div>
        </div>

        <div className="message-input-wrapper">

          <textarea
            className="message-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              "Paste a suspicious SMS, WhatsApp message, social media message, or other text here..."
            }
            rows={9}
          />

          <div className="input-footer">
            <span>
              {message.length} characters
            </span>

            <span>
              🔒 Analysis stays within SnapGuard X
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="analyzer-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="analyzer-actions">

          <button
            className="primary-analyze-button"
            onClick={analyzeMessage}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                🔍 Analyze Message
              </>
            )}
          </button>

          {(message || result) && (
            <button
              className="secondary-button"
              onClick={clearAnalysis}
              disabled={loading}
            >
              Clear
            </button>
          )}

        </div>
      </div>

      {/* =========================
          RESULTS
      ========================= */}
      {result && (
        <div className="analysis-results">

          {/* =========================
              RESULT HEADER
          ========================= */}
          <div className="result-title-row">
            <div>
              <div className="page-eyebrow">
                ANALYSIS COMPLETE
              </div>

              <h2>Security Assessment</h2>

              <p>
                SnapGuard X analyzed the message using security
                rules and its trained AI classifier.
              </p>
            </div>

            <div className="analysis-complete-badge">
              <span className="status-dot"></span>
              Analysis Complete
            </div>
          </div>

          {/* =========================
              RISK SUMMARY
          ========================= */}
          <div className="risk-summary-grid">

            {/* Risk Score */}
            <div
              className={`result-card risk-card ${getRiskClass(
                result.risk_level
              )}`}
            >
              <div className="result-card-label">
                RISK LEVEL
              </div>

              <div className="risk-main">

                <div className="risk-icon">
                  {getRiskIcon(result.risk_level)}
                </div>

                <div>
                  <div className="risk-level">
                    {result.risk_level || "UNKNOWN"}
                  </div>

                  <div className="risk-verdict">
                    {result.verdict || "Assessment complete"}
                  </div>
                </div>

              </div>

              <div className="risk-score">
                <strong>{result.risk_score ?? 0}</strong>
                <span>/100</span>
              </div>

              <div className="risk-progress">
                <div
                  className="risk-progress-fill"
                  style={{
                    width: `${Math.min(
                      Number(result.risk_score ?? 0),
                      100
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* AI Classification */}
            <div className="result-card ai-classification-card">

              <div className="result-card-label">
                AI CLASSIFICATION
              </div>

              <div className="ai-classification">
                <span className="ai-brain">
                  🤖
                </span>

                <div>
                  <div className="classification-label">
                    {result.ai_prediction || "UNKNOWN"}
                  </div>

                  <div className="classification-confidence">
                    {formatConfidence(result.ai_confidence)}
                    {" "}
                    confidence
                  </div>
                </div>
              </div>

              <div className="ai-status">
                <span className="status-dot"></span>

                {result.ai_status ||
                  "AI analysis completed"}
              </div>

            </div>
          </div>

          {/* =========================
              PROBABILITY BREAKDOWN
          ========================= */}
          <div className="analyzer-card">

            <div className="section-heading">
              <div className="section-icon">
                📊
              </div>

              <div>
                <h3>AI Probability Breakdown</h3>
                <p>
                  Classification probabilities produced by
                  the trained AI model.
                </p>
              </div>
            </div>

            <div className="probability-list">

              {/* SAFE */}
              <div className="probability-item">

                <div className="probability-header">
                  <span>SAFE</span>

                  <strong>
                    {getProbability(
                      result.ai_probabilities,
                      "SAFE"
                    ).toFixed(2)}
                    %
                  </strong>
                </div>

                <div className="probability-bar">
                  <div
                    className="probability-fill safe-fill"
                    style={{
                      width: `${getProbability(
                        result.ai_probabilities,
                        "SAFE"
                      )}%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* SCAM */}
              <div className="probability-item">

                <div className="probability-header">
                  <span>SCAM</span>

                  <strong>
                    {getProbability(
                      result.ai_probabilities,
                      "SCAM"
                    ).toFixed(2)}
                    %
                  </strong>
                </div>

                <div className="probability-bar">
                  <div
                    className="probability-fill scam-fill"
                    style={{
                      width: `${getProbability(
                        result.ai_probabilities,
                        "SCAM"
                      )}%`,
                    }}
                  ></div>
                </div>

              </div>

              {/* SUSPICIOUS */}
              <div className="probability-item">

                <div className="probability-header">
                  <span>SUSPICIOUS</span>

                  <strong>
                    {getProbability(
                      result.ai_probabilities,
                      "SUSPICIOUS"
                    ).toFixed(2)}
                    %
                  </strong>
                </div>

                <div className="probability-bar">
                  <div
                    className="probability-fill suspicious-fill"
                    style={{
                      width: `${getProbability(
                        result.ai_probabilities,
                        "SUSPICIOUS"
                      )}%`,
                    }}
                  ></div>
                </div>

              </div>

            </div>
          </div>

          {/* =========================
              SECURITY INDICATORS
          ========================= */}
          <div className="analyzer-card">

            <div className="section-heading">
              <div className="section-icon">
                🛡️
              </div>

              <div>
                <h3>Security Indicators</h3>

                <p>
                  Signals detected in the submitted message.
                </p>
              </div>

              <div className="indicator-count">
                {result.indicators?.length || 0}
              </div>
            </div>

            {result.indicators &&
            result.indicators.length > 0 ? (
              <div className="indicator-grid">

                {result.indicators.map(
                  (indicator, index) => (
                    <div
                      className="indicator-card"
                      key={index}
                    >

                      <div className="indicator-icon">
                        ⚠️
                      </div>

                      <div className="indicator-content">

                        <h4>
                          {indicator.title ||
                            "Security Indicator"}
                        </h4>

                        <p>
                          {indicator.description ||
                            "A security signal was detected."}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="empty-state">
                <span>✓</span>
                <p>
                  No major security indicators were detected.
                </p>
              </div>
            )}

          </div>

          {/* =========================
              TRUST CHAIN
          ========================= */}
          <div className="analyzer-card trust-chain-card">

            <div className="section-heading">

              <div className="section-icon">
                🔗
              </div>

              <div>
                <h3>Trust Chain</h3>

                <p>
                  Understand how SnapGuard X moved from
                  detection to recommendation.
                </p>
              </div>

            </div>

            <div className="trust-chain-flow">

              {/* DETECT */}
              <div className="trust-step">

                <div className="trust-step-number">
                  01
                </div>

                <div className="trust-step-icon">
                  🔍
                </div>

                <h4>Detect</h4>

                <p>
                  {result.trust_chain?.detect ||
                    "Security indicators were detected."}
                </p>

              </div>

              <div className="trust-connector">
                →
              </div>

              {/* CONNECT */}
              <div className="trust-step">

                <div className="trust-step-number">
                  02
                </div>

                <div className="trust-step-icon">
                  🔗
                </div>

                <h4>Connect</h4>

                <p>
                  {result.trust_chain?.connect ||
                    "Evidence and AI analysis were combined."}
                </p>

              </div>

              <div className="trust-connector">
                →
              </div>

              {/* EXPLAIN */}
              <div className="trust-step">

                <div className="trust-step-number">
                  03
                </div>

                <div className="trust-step-icon">
                  💡
                </div>

                <h4>Explain</h4>

                <p>
                  {result.trust_chain?.explain ||
                    "The AI result is explained using evidence and confidence."}
                </p>

              </div>

              <div className="trust-connector">
                →
              </div>

              {/* PROTECT */}
              <div className="trust-step">

                <div className="trust-step-number">
                  04
                </div>

                <div className="trust-step-icon">
                  🛡️
                </div>

                <h4>Protect</h4>

                <p>
                  {result.trust_chain?.protect ||
                    result.recommendation ||
                    "Verify before taking action."}
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              RECOMMENDATION
          ========================= */}
          <div className="recommendation-card">

            <div className="recommendation-icon">
              🛡️
            </div>

            <div className="recommendation-content">

              <div className="result-card-label">
                SECURITY RECOMMENDATION
              </div>

              <h3>
                Before You Trust This Message
              </h3>

              <p>
                {result.recommendation ||
                  "Verify the sender, request, and any destination before taking action."}
              </p>

            </div>

          </div>

        </div>
      )}

      {/* =========================
          EMPTY STATE
      ========================= */}
      {!result && !loading && (
        <div className="analyzer-empty-state">

          <div className="empty-shield">
            🛡️
          </div>

          <h3>
            Ready to Analyze
          </h3>

          <p>
            Paste a message above and let SnapGuard X
            inspect it for potential security risks.
          </p>

          <div className="empty-features">

            <span>🔍 Detect threats</span>
            <span>🤖 AI classification</span>
            <span>🔗 Explain evidence</span>
            <span>🛡️ Get recommendations</span>

          </div>

        </div>
      )}

    </div>
  );
}

export default MessageAnalyzer;