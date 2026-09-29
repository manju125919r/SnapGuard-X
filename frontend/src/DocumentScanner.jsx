import React, { useState } from "react";

const DocumentScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    const allowedExtensions = [".pdf", ".txt"];
    const fileName = file.name.toLowerCase();

    const validType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!validType) {
      setError("Please select a PDF or TXT document.");
      setSelectedFile(null);
      setResult(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setResult(null);
  };

  const analyzeDocument = async () => {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://127.0.0.1:8000/analyze-document",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Document analysis failed."
        );
      }

      setResult(data);
    } catch (err) {
      console.error("Document analysis error:", err);
      setError(
        err.message ||
          "Unable to connect to the SnapGuard X backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = (riskLevel) => {
    if (riskLevel === "HIGH") return "risk-high";
    if (riskLevel === "MEDIUM") return "risk-medium";
    return "risk-low";
  };

  const getProbabilityEntries = () => {
    if (!result?.ai_probabilities) return [];

    return Object.entries(result.ai_probabilities);
  };

  return (
    <div className="analyzer-page">

      {/* Header */}
      <div className="analyzer-header">
        <div>
          <div className="analyzer-badge">
            DOCUMENT SECURITY
          </div>

          <h1>Document Scanner</h1>

          <p>
            Upload a PDF or TXT document and let SnapGuard X
            analyze its security signals.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="analyzer-card">

        <div className="section-title">
          <span>📄</span>
          Select Document
        </div>

        <div className="document-upload-box">

          <div className="upload-icon">
            📄
          </div>

          <h3>
            Choose a document from your device
          </h3>

          <p>
            Supported formats: PDF, TXT
          </p>

          <label className="upload-button">
            Choose Document

            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {selectedFile && (
            <div className="selected-file">
              <span>📎</span>

              <div>
                <strong>{selectedFile.name}</strong>

                <small>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </small>
              </div>
            </div>
          )}

        </div>

        {error && (
          <div className="error-message">
            ⚠ {error}
          </div>
        )}

        <button
          className="analyze-button"
          onClick={analyzeDocument}
          disabled={!selectedFile || loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Analyzing Document...
            </>
          ) : (
            <>
              🔍 Analyze Document
            </>
          )}
        </button>

      </div>

      {/* Results */}
      {result && (
        <div className="document-results">

          {/* Main Risk Card */}
          <div className="analyzer-card">

            <div className="section-title">
              <span>🛡️</span>
              Document Security Analysis
            </div>

            <div className="risk-summary">

              <div
                className={`risk-circle ${getRiskClass(
                  result.risk_level
                )}`}
              >
                <span>{result.risk_score}</span>
                <small>/100</small>
              </div>

              <div className="risk-details">

                <div
                  className={`risk-label ${getRiskClass(
                    result.risk_level
                  )}`}
                >
                  {result.risk_level}
                </div>

                <h2>{result.verdict}</h2>

                <p>
                  File: <strong>{result.filename}</strong>
                </p>

                <p>
                  Type:{" "}
                  <strong>{result.document_type}</strong>
                  {" • "}
                  Pages: <strong>{result.pages}</strong>
                </p>

              </div>

            </div>

          </div>

          {/* AI Analysis */}
          <div className="analyzer-card">

            <div className="section-title">
              <span>🤖</span>
              AI Security Analysis
            </div>

            <div className="ai-result">

              <div className="ai-main">

                <div className="ai-label">
                  AI CLASSIFICATION
                </div>

                <div className="ai-prediction">
                  {result.ai_prediction}
                </div>

                <div className="ai-confidence">
                  Confidence:{" "}
                  <strong>
                    {(result.ai_confidence * 100).toFixed(2)}%
                  </strong>
                </div>

              </div>

              <div className="model-status">
                <span className="status-dot"></span>

                {result.ai_status ||
                  "AI analysis completed"}
              </div>

            </div>

            {/* Probability Breakdown */}
            <div className="probability-section">

              <h3>Probability Breakdown</h3>

              {getProbabilityEntries().map(
                ([label, probability]) => (
                  <div
                    className="probability-row"
                    key={label}
                  >

                    <div className="probability-header">
                      <span>{label}</span>

                      <span>
                        {(probability * 100).toFixed(2)}%
                      </span>
                    </div>

                    <div className="probability-bar">
                      <div
                        className="probability-fill"
                        style={{
                          width: `${probability * 100}%`,
                        }}
                      ></div>
                    </div>

                  </div>
                )
              )}

            </div>

          </div>

          {/* Security Indicators */}
          <div className="analyzer-card">

            <div className="section-title">
              <span>🚨</span>
              Security Indicators
            </div>

            {result.indicators &&
            result.indicators.length > 0 ? (
              <div className="indicator-list">

                {result.indicators.map(
                  (indicator, index) => (
                    <div
                      className="indicator-item"
                      key={index}
                    >

                      <div className="indicator-icon">
                        ⚠️
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
                )}

              </div>
            ) : (
              <div className="no-indicators">
                ✓ No major security indicators detected.
              </div>
            )}

          </div>

          {/* Detected URLs */}
          <div className="analyzer-card">

            <div className="section-title">
              <span>🔗</span>
              Detected URLs
            </div>

            {result.detected_urls &&
            result.detected_urls.length > 0 ? (
              <div className="url-list">

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
            ) : (
              <div className="no-indicators">
                No URLs detected in this document.
              </div>
            )}

          </div>

          {/* Trust Chain */}
          {result.trust_chain && (
            <div className="analyzer-card trust-chain-card">

              <div className="section-title">
                <span>🔗</span>
                Trust Chain
              </div>

              <div className="trust-chain">

                <div className="trust-step">
                  <div className="trust-number">
                    1
                  </div>

                  <div>
                    <strong>Detect</strong>
                    <p>
                      {result.trust_chain.detect}
                    </p>
                  </div>
                </div>

                <div className="trust-line"></div>

                <div className="trust-step">
                  <div className="trust-number">
                    2
                  </div>

                  <div>
                    <strong>Connect</strong>
                    <p>
                      {result.trust_chain.connect}
                    </p>
                  </div>
                </div>

                <div className="trust-line"></div>

                <div className="trust-step">
                  <div className="trust-number">
                    3
                  </div>

                  <div>
                    <strong>Explain</strong>
                    <p>
                      {result.trust_chain.explain}
                    </p>
                  </div>
                </div>

                <div className="trust-line"></div>

                <div className="trust-step">
                  <div className="trust-number">
                    4
                  </div>

                  <div>
                    <strong>Protect</strong>
                    <p>
                      {result.trust_chain.protect}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Recommendation */}
          <div className="analyzer-card recommendation-card">

            <div className="section-title">
              <span>🛡️</span>
              Recommendation
            </div>

            <p className="recommendation-text">
              {result.recommendation}
            </p>

          </div>

          {/* Extracted Text */}
          <div className="analyzer-card">

            <div className="section-title">
              <span>📃</span>
              Extracted Document Text
            </div>

            <div className="extracted-text">
              {result.extracted_text ||
                "No text was extracted from this document."}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default DocumentScanner;