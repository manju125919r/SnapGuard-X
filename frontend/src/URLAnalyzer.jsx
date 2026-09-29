import React, { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function URLAnalyzer() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeURL = async () => {
    if (!url.trim()) {
      setError("Please enter a URL to analyze.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/analyze-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "URL analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to analyze URL.");
    } finally {
      setLoading(false);
    }
  };

  const tryExample = () => {
    setUrl("http://secure-account-verification.test/login");
    setResult(null);
    setError("");
  };

  const clearAll = () => {
    setUrl("");
    setResult(null);
    setError("");
  };

  const getRiskClass = (level) => {
    const value = String(level || "").toLowerCase();

    if (value === "high") return "risk-high";
    if (value === "medium") return "risk-medium";
    return "risk-low";
  };

  return (
    <div className="analyzer-page">
      {/* Header */}
      <div className="analyzer-header">
        <div>
          <div className="page-eyebrow">URL SECURITY</div>

          <h1 className="analyzer-title">URL Analyzer</h1>

          <p className="analyzer-subtitle">
            Check suspicious links before you open them. SnapGuard X analyzes
            the URL structure and explains the detected warning signals.
          </p>
        </div>

        <div className="analyzer-status">
          <span className="status-dot"></span>
          SnapGuard AI Online
        </div>
      </div>

      {/* Main URL Card */}
      <div className="analyzer-card">
        <div className="card-heading">
          <div className="section-icon">🔗</div>

          <div>
            <h2>Analyze a Website URL</h2>
            <p>
              SnapGuard checks the URL structure without opening or visiting
              the website.
            </p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="url-input">Website URL</label>

          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                analyzeURL();
              }
            }}
            placeholder="https://example.com"
            maxLength={2000}
          />

          <div className="form-hint">
            Paste the complete URL. SnapGuard X analyzes the structure locally
            and does not visit the website.
          </div>
        </div>

        <div className="input-footer">
          <span>{url.length} / 2000 characters</span>

          <span>
            🔒 URL content stays within the SnapGuard X analysis flow.
          </span>
        </div>

        <div className="analyzer-actions">
          <button
            className="primary-analyze-button"
            onClick={analyzeURL}
            disabled={loading}
          >
            {loading ? "⏳ Analyzing URL..." : "🔍 Analyze URL"}
          </button>

          <button
            className="secondary-button"
            onClick={tryExample}
            type="button"
          >
            ✨ Try Example
          </button>

          {(url || result) && (
            <button
              className="secondary-button"
              onClick={clearAll}
              type="button"
            >
              Clear
            </button>
          )}
        </div>

        {error && <div className="analyzer-error">⚠️ {error}</div>}
      </div>

      {/* Empty State */}
      {!result && !loading && !error && (
        <div className="analyzer-empty-state">
          <div className="empty-shield">🔍</div>

          <h2>Ready to Check</h2>

          <p>
            Enter a URL above and SnapGuard X will inspect its security
            characteristics.
          </p>

          <div className="empty-features">
            <span>🔗 URL structure</span>
            <span>🛡️ Security signals</span>
            <span>🧠 AI analysis</span>
            <span>💡 Recommendations</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="analyzer-empty-state">
          <div className="empty-shield">⏳</div>
          <h2>Analyzing URL</h2>
          <p>
            SnapGuard X is checking the URL structure and security indicators.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="analysis-results">
          <div className="result-title-row">
            <div>
              <div className="page-eyebrow">ANALYSIS COMPLETE</div>
              <h2>URL Security Analysis</h2>
            </div>

            <span className="analysis-complete-badge">✓ Complete</span>
          </div>

          {/* Risk Summary */}
          <div className="risk-summary-grid">
            <div className={`result-card risk-card ${getRiskClass(result.risk_level)}`}>
              <div className="risk-icon">🛡️</div>

              <div className="risk-main">
                <span className="risk-level">
                  {result.risk_level || "UNKNOWN"}
                </span>

                <span className="risk-verdict">
                  {result.verdict || "Analysis completed"}
                </span>
              </div>

              <div className="risk-score">
                {result.risk_score ?? 0}
                <small>/100</small>
              </div>

              <div className="risk-progress">
                <div
                  className="risk-progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(result.risk_score || 0))
                    )}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* AI Classification */}
            <div className="result-card ai-classification-card">
              <div className="ai-classification">
                <div className="ai-brain">🧠</div>

                <div>
                  <div className="classification-label">
                    AI Classification
                  </div>

                  <div className="classification-confidence">
                    {result.ai_prediction || "UNKNOWN"}
                  </div>

                  <div className="ai-status">
                    Confidence:{" "}
                    {result.ai_confidence !== undefined
                      ? `${(result.ai_confidence * 100).toFixed(2)}%`
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Probability Breakdown */}
          {result.ai_probabilities && (
            <div className="result-card">
              <div className="section-heading">
                <span className="section-icon">📊</span>

                <div>
                  <h3>AI Probability Breakdown</h3>
                  <p>Model classification confidence by category.</p>
                </div>
              </div>

              <div className="probability-list">
                {Object.entries(result.ai_probabilities).map(
                  ([label, probability]) => {
                    const percentage = Number(probability) * 100;

                    const fillClass =
                      label === "SAFE"
                        ? "safe-fill"
                        : label === "SCAM"
                        ? "scam-fill"
                        : "suspicious-fill";

                    return (
                      <div className="probability-item" key={label}>
                        <div className="probability-header">
                          <span>{label}</span>
                          <strong>{percentage.toFixed(2)}%</strong>
                        </div>

                        <div className="probability-bar">
                          <div
                            className={`probability-fill ${fillClass}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* URL */}
          <div className="result-card">
            <div className="section-heading">
              <span className="section-icon">🔗</span>

              <div>
                <h3>Analyzed URL</h3>
                <p>The URL inspected by SnapGuard X.</p>
              </div>
            </div>

            <div className="detected-url-list">
              <div className="detected-url">{result.url || url}</div>
            </div>
          </div>

          {/* Indicators */}
          <div className="result-card">
            <div className="section-heading">
              <span className="section-icon">🚨</span>

              <div>
                <h3>Security Indicators</h3>
                <p>Signals detected from the URL structure.</p>
              </div>
            </div>

            {result.indicators && result.indicators.length > 0 ? (
              <div className="indicator-grid">
                {result.indicators.map((indicator, index) => (
                  <div className="indicator-card" key={index}>
                    <div className="indicator-icon">⚠️</div>

                    <div className="indicator-content">
                      <strong>
                        {typeof indicator === "string"
                          ? indicator
                          : indicator.type || indicator.name || "Security Signal"}
                      </strong>

                      {typeof indicator !== "string" && indicator.description && (
                        <p>{indicator.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="analyzer-empty-state compact">
                <div className="empty-shield">✓</div>
                <h3>No Major Warning Signals</h3>
                <p>
                  SnapGuard X did not identify major URL security indicators.
                </p>
              </div>
            )}
          </div>

          {/* Trust Chain */}
          {result.trust_chain && (
            <div className="trust-chain-card">
              <div className="section-heading">
                <span className="section-icon">🔐</span>

                <div>
                  <h3>Trust Chain</h3>
                  <p>How SnapGuard X reached the recommendation.</p>
                </div>
              </div>

              <div className="trust-chain-flow">
                <div className="trust-step">
                  <span className="trust-step-number">01</span>
                  <span className="trust-step-icon">🔎</span>
                  <strong>Detect</strong>
                  <p>{result.trust_chain.detect}</p>
                </div>

                <div className="trust-connector"></div>

                <div className="trust-step">
                  <span className="trust-step-number">02</span>
                  <span className="trust-step-icon">🔗</span>
                  <strong>Connect</strong>
                  <p>{result.trust_chain.connect}</p>
                </div>

                <div className="trust-connector"></div>

                <div className="trust-step">
                  <span className="trust-step-number">03</span>
                  <span className="trust-step-icon">💡</span>
                  <strong>Explain</strong>
                  <p>{result.trust_chain.explain}</p>
                </div>

                <div className="trust-connector"></div>

                <div className="trust-step">
                  <span className="trust-step-number">04</span>
                  <span className="trust-step-icon">🛡️</span>
                  <strong>Protect</strong>
                  <p>{result.trust_chain.protect}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="recommendation-card">
              <div className="recommendation-icon">🛡️</div>

              <div className="recommendation-content">
                <h3>Recommended Action</h3>
                <p>{result.recommendation}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default URLAnalyzer;