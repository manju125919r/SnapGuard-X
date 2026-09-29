import React, { useRef, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ImageScanner() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    setFile(selectedFile);
    setError("");
    setResult(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files[0]);
  };

  const analyzeImage = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/analyze-image`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Image analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
          <div className="page-eyebrow">IMAGE SECURITY</div>

          <h1 className="analyzer-title">Image Scanner</h1>

          <p className="analyzer-subtitle">
            Upload a suspicious screenshot and let SnapGuard X inspect its
            visible security signals.
          </p>
        </div>

        <div className="analyzer-status">
          <span className="status-dot"></span>
          OCR + AI Online
        </div>
      </div>

      {/* Upload Card */}
      <div className="analyzer-card">
        <div className="card-heading">
          <div className="section-icon">🖼️</div>

          <div>
            <h2>Suspicious Screenshot</h2>

            <p>
              SnapGuard X extracts visible text using OCR before analyzing
              security indicators.
            </p>
          </div>
        </div>

        <div
          className="document-upload-area"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="document-upload-icon">🖼️</div>

          <h3>{file ? file.name : "Upload an Image"}</h3>

          <p>
            {file
              ? `${(file.size / 1024).toFixed(1)} KB selected`
              : "PNG, JPG, JPEG or WEBP"}
          </p>

          <button
            className="secondary-button"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            📁 Choose Image
          </button>

          <input
            ref={fileInputRef}
            className="file-input"
            type="file"
            accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
          />
        </div>

        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Selected screenshot preview" />
          </div>
        )}

        <div className="analyzer-actions">
          <button
            className="primary-analyze-button"
            onClick={analyzeImage}
            disabled={!file || loading}
          >
            {loading ? "⏳ Scanning Image..." : "🔍 Analyze Image"}
          </button>

          {(file || result) && (
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

      {/* Empty */}
      {!result && !loading && !error && (
        <div className="analyzer-empty-state">
          <div className="empty-shield">🛡️</div>

          <h2>Ready to Scan</h2>

          <p>
            Upload a suspicious screenshot and SnapGuard X will extract and
            analyze the visible content.
          </p>

          <div className="empty-features">
            <span>📷 OCR extraction</span>
            <span>🚨 Security indicators</span>
            <span>🧠 AI classification</span>
            <span>🛡️ Protection advice</span>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="analyzer-empty-state">
          <div className="empty-shield">⏳</div>

          <h2>Scanning Image</h2>

          <p>
            SnapGuard X is extracting visible text and analyzing security
            signals.
          </p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="analysis-results">
          <div className="result-title-row">
            <div>
              <div className="page-eyebrow">SCAN COMPLETE</div>
              <h2>Image Security Analysis</h2>
            </div>

            <span className="analysis-complete-badge">✓ Complete</span>
          </div>

          {/* Risk */}
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

          {/* Probability */}
          {result.ai_probabilities && (
            <div className="result-card">
              <div className="section-heading">
                <span className="section-icon">📊</span>

                <div>
                  <h3>AI Probability Breakdown</h3>
                  <p>Classification confidence from the trained model.</p>
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

          {/* OCR Text */}
          <div className="result-card">
            <div className="section-heading">
              <span className="section-icon">📝</span>

              <div>
                <h3>Extracted Text</h3>
                <p>Text detected from the uploaded image using OCR.</p>
              </div>
            </div>

            <div className="extracted-text">
              {result.extracted_text ||
                result.ocr_text ||
                "No readable text was detected in the image."}
            </div>
          </div>

          {/* URLs */}
          {result.detected_urls && result.detected_urls.length > 0 && (
            <div className="result-card">
              <div className="section-heading">
                <span className="section-icon">🔗</span>

                <div>
                  <h3>Detected URLs</h3>
                  <p>Links found inside the screenshot.</p>
                </div>
              </div>

              <div className="detected-url-list">
                {result.detected_urls.map((detectedURL, index) => (
                  <div className="detected-url" key={index}>
                    {detectedURL}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indicators */}
          <div className="result-card">
            <div className="section-heading">
              <span className="section-icon">🚨</span>

              <div>
                <h3>Security Indicators</h3>
                <p>Signals detected from the image content.</p>
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

                      {typeof indicator !== "string" &&
                        indicator.description && (
                          <p>{indicator.description}</p>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No major security indicators were detected.</p>
            )}
          </div>

          {/* Trust Chain */}
          {result.trust_chain && (
            <div className="trust-chain-card">
              <div className="section-heading">
                <span className="section-icon">🔐</span>

                <div>
                  <h3>Trust Chain</h3>
                  <p>How the security recommendation was produced.</p>
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

export default ImageScanner;