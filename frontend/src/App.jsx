import { Fragment, useState } from "react";
import "./App.css";

import MessageAnalyzer from "./MessageAnalyzer";
import URLAnalyzer from "./URLAnalyzer";
import ImageScanner from "./ImageScanner";
import EmailAnalyzer from "./EmailAnalyzer";

const API_BASE = "http://127.0.0.1:8000";

const NAV_ITEMS = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "message", icon: "💬", label: "Message Analyzer" },
  { id: "url", icon: "🔗", label: "URL Analyzer" },
  { id: "image", icon: "🖼️", label: "Image Scanner" },
  { id: "email", icon: "📧", label: "Email Analyzer" },
  { id: "document", icon: "📄", label: "Document Scanner" },
  { id: "trust", icon: "🕸️", label: "Trust Chain" },
  { id: "history", icon: "🕒", label: "History" },
];

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("snapguard-history") || "[]");
    } catch {
      return [];
    }
  });

  const pageTitle = {
    dashboard: "Security Dashboard",
    message: "Message Analyzer",
    url: "URL Analyzer",
    image: "Image Scanner",
    email: "Email Analyzer",
    document: "Document Scanner",
    trust: "Trust Chain",
    history: "Security History",
  };

  const navigate = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addHistory = (entry) => {
    const next = [
      {
        ...entry,
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
      },
      ...history,
    ].slice(0, 50);

    setHistory(next);
    localStorage.setItem("snapguard-history", JSON.stringify(next));
  };

  const renderPage = () => {
    switch (activePage) {
      case "message":
        return <MessageAnalyzer />;

      case "url":
        return <URLAnalyzer />;

      case "image":
        return <ImageScanner />;

      case "email":
        return <EmailAnalyzer />;

      case "document":
        return <DocumentScanner onHistory={addHistory} />;

      case "trust":
        return <TrustChainPage />;

      case "history":
        return (
          <HistoryPage
            history={history}
            onClear={() => {
              setHistory([]);
              localStorage.removeItem("snapguard-history");
            }}
          />
        );

      case "dashboard":
      default:
        return (
          <Dashboard
            setActivePage={navigate}
            history={history}
          />
        );
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">🛡️</div>

          <div>
            <h2>SnapGuard X</h2>
            <span>Explain Before You Trust</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`nav-item sidebar-button ${
                activePage === item.id ? "active" : ""
              }`}
              onClick={() => navigate(item.id)}
              aria-current={activePage === item.id ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="nav-item sidebar-button"
            onClick={() =>
              alert(
                "SnapGuard X Settings\n\nAI model: ONNX\nRuntime: ONNX Runtime\nPrivacy mode: Active"
              )
            }
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </button>

          <div className="privacy-card">
            <div className="privacy-icon">🔒</div>

            <div>
              <strong>Privacy Mode</strong>
              <p>On-device AI</p>
            </div>

            <div className="status-dot" title="Active" />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="welcome">Welcome back</p>

            <h1>{pageTitle[activePage] || "SnapGuard X"}</h1>
          </div>

          <div className="top-actions">
            <div className="protected-status">
              <span className="status-dot" />
              Protected
            </div>

            <button
              type="button"
              className="notification"
              onClick={() =>
                alert(
                  "SnapGuard X is ready.\n\nONNX AI: READY\nPrivacy Mode: ACTIVE"
                )
              }
              aria-label="Security status"
              title="Security status"
            >
              🔔
            </button>

            <div className="profile">
              <div className="avatar">M</div>

              <div>
                <strong>Manjunadh</strong>
                <span>Protected</span>
              </div>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>
    </div>
  );
}

/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard({ setActivePage, history }) {
  const threats = history.filter(
    (item) =>
      item.riskLevel === "HIGH" ||
      item.riskLevel === "MEDIUM"
  ).length;

  return (
    <div className="dashboard">
      <section className="hero">
        <div>
          <span className="hero-badge">
            🛡️ AI PROTECTION ACTIVE
          </span>

          <h2>
            Stay Safe.
            <br />
            <span>Stay Ahead.</span>
          </h2>

          <p>
            Analyze suspicious messages, links, images, emails,
            and documents with explainable AI.
          </p>

          <div className="hero-actions">
            <button
              type="button"
              className="primary-analyze-button"
              onClick={() => setActivePage("message")}
            >
              Start Security Check →
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setActivePage("trust")}
            >
              View Trust Chain
            </button>
          </div>
        </div>

        <div className="shield-graphic" aria-hidden="true">
          <div className="big-shield">🛡️</div>
          <div className="pulse pulse-1" />
          <div className="pulse pulse-2" />
        </div>
      </section>

      <section>
        <div className="section-heading">
          <div>
            <span className="mini-label">SECURITY TOOLS</span>
            <h2>Quick Security Checks</h2>
            <p>
              Choose the type of content you want SnapGuard X
              to inspect.
            </p>
          </div>
        </div>

        <div className="action-grid">
          <SecurityAction
            icon="💬"
            tone="blue"
            title="Check Message"
            description="Detect scam, phishing, urgency, and sensitive-information signals."
            onClick={() => setActivePage("message")}
          />

          <SecurityAction
            icon="🔗"
            tone="purple"
            title="Analyze URL"
            description="Inspect HTTPS, domain structure, suspicious keywords, and URL patterns."
            onClick={() => setActivePage("url")}
          />

          <SecurityAction
            icon="🖼️"
            tone="orange"
            title="Scan Image"
            description="Use OCR and AI analysis to inspect screenshots and image content."
            onClick={() => setActivePage("image")}
          />

          <SecurityAction
            icon="📧"
            tone="blue"
            title="Analyze Email"
            description="Review sender, subject, body, links, and security-related signals."
            onClick={() => setActivePage("email")}
          />

          <SecurityAction
            icon="📄"
            tone="green"
            title="Scan Document"
            description="Extract text from supported documents and analyze security indicators."
            onClick={() => setActivePage("document")}
          />

          <SecurityAction
            icon="🕸️"
            tone="purple"
            title="Trust Chain"
            description="Understand how SnapGuard X detects, connects, explains, and protects."
            onClick={() => setActivePage("trust")}
          />
        </div>
      </section>

      <section className="stats-section">
        <div className="stat-card">
          <span>Analyses Recorded</span>
          <strong>{history.length}</strong>
          <small>Stored locally in this browser</small>
        </div>

        <div className="stat-card">
          <span>Security Warnings</span>
          <strong>{threats}</strong>
          <small>Medium or high risk results</small>
        </div>

        <div className="stat-card">
          <span>AI Runtime</span>
          <strong className="safe">ONNX</strong>
          <small>Primary AI inference engine</small>
        </div>

        <div className="stat-card">
          <span>Privacy Status</span>
          <strong className="safe">ACTIVE</strong>
          <small>Local browser history + local API</small>
        </div>
      </section>

      <section className="trust-section">
        <div>
          <span className="mini-label">CORE USP</span>

          <h2>
            Don&apos;t just detect.
            <span> Explain.</span>
          </h2>

          <p>
            SnapGuard X combines rule-based security signals
            with AI classification and explains the evidence
            behind the result.
          </p>
        </div>

        <div className="trust-flow">
          <div>🔍 Detect</div>
          <span>→</span>
          <div>🔗 Connect</div>
          <span>→</span>
          <div>🧠 Explain</div>
          <span>→</span>
          <div>🛡️ Protect</div>
        </div>
      </section>

      <footer>
        <span>SnapGuard X © 2026</span>
        <span>Privacy-first AI Security</span>
      </footer>
    </div>
  );
}

function SecurityAction({
  icon,
  tone,
  title,
  description,
  onClick,
}) {
  return (
    <div className="action-card">
      <div className={`action-icon ${tone}`}>{icon}</div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button
        type="button"
        className="action-card-button"
        onClick={onClick}
      >
        Open Analyzer →
      </button>
    </div>
  );
}

/* =========================================================
   DOCUMENT SCANNER
   ========================================================= */

function DocumentScanner({ onHistory }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const selectFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowed = ["application/pdf", "text/plain"];
    const extension = selectedFile.name
      .split(".")
      .pop()
      .toLowerCase();

    if (!allowed.includes(selectedFile.type) &&
        !["pdf", "txt"].includes(extension)) {
      setError("Please select a PDF or TXT document.");
      return;
    }

    setFile(selectedFile);
    setResult(null);
    setError("");
  };

  const analyzeDocument = async () => {
    if (!file) {
      setError("Please select a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE}/analyze-document`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(
          data.detail ||
          data.message ||
          "Document analysis failed."
        );
      }

      setResult(data);

      onHistory?.({
        type: "Document",
        name: file.name,
        riskLevel: data.risk_level,
        riskScore: data.risk_score,
        prediction: data.ai_prediction || "UNKNOWN",
      });
    } catch (err) {
      setError(
        err.message ||
        "Could not connect to SnapGuard X backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const riskClass =
    result?.risk_level === "HIGH"
      ? "risk-high"
      : result?.risk_level === "MEDIUM"
      ? "risk-medium"
      : "risk-low";

  return (
    <div className="analyzer-page">
      <div className="analyzer-header">
        <span className="section-label">DOCUMENT SECURITY</span>

        <h1>Document Scanner</h1>

        <p>
          Upload a supported document and let SnapGuard X
          extract, inspect, and explain its security signals.
        </p>
      </div>

      <div className="analyzer-card document-scanner-card">
        {!file ? (
          <label
            className={`document-upload-area ${
              dragging ? "is-dragging" : ""
            }`}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              selectFile(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="document-upload-icon">📄</div>

            <h3>Drop your document here</h3>

            <p>
              Upload a PDF or TXT file for security analysis.
              <br />
              Your document is sent to the local SnapGuard X API.
            </p>

            <span className="document-browse-button">
              Browse Document
            </span>

            <span className="document-format-hint">
              Supported formats: PDF, TXT
            </span>

            <input
              className="file-input"
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(e) =>
                selectFile(e.target.files?.[0])
              }
            />
          </label>
        ) : (
          <div className="document-selected-file">
            <div className="document-file-icon">📄</div>

            <div className="document-file-info">
              <span className="document-file-name">
                {file.name}
              </span>

              <span className="document-file-meta">
                {(file.size / 1024).toFixed(1)} KB
              </span>

              <span className="document-file-status">
                <span className="document-file-status-dot" />
                Ready for analysis
              </span>
            </div>

            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setFile(null);
                setResult(null);
                setError("");
              }}
              disabled={loading}
            >
              Change
            </button>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            ⚠️ {error}
          </div>
        )}

        {file && !result && (
          <div className="document-analyze-actions">
            <button
              type="button"
              className="document-analyze-button"
              onClick={analyzeDocument}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Analyzing Document...
                </>
              ) : (
                <>🔍 Analyze Document</>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className="analysis-result">
            <div className={`risk-card ${riskClass}`}>
              <div>
                <span className="result-label">RISK LEVEL</span>
                <h3>{result.risk_level}</h3>
                <p>{result.verdict}</p>
              </div>

              <div className="risk-score">
                <strong>{result.risk_score}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="ai-card">
              <span className="result-label">
                AI CLASSIFICATION
              </span>

              <div className="ai-main">
                <strong>
                  {result.ai_prediction || "UNKNOWN"}
                </strong>

                <span>
                  {result.ai_confidence
                    ? `${(
                        result.ai_confidence * 100
                      ).toFixed(2)}% confidence`
                    : "Confidence unavailable"}
                </span>
              </div>

              <div className="model-status">
                <span className="status-dot" />
                {result.ai_status || "Analysis completed"}
              </div>
            </div>

            <div className="indicators-card">
              <div className="card-title-row">
                <div className="card-title-icon">⚠️</div>
                <div>
                  <h3>Security Indicators</h3>
                  <p>
                    Signals identified during document analysis.
                  </p>
                </div>
              </div>

              {result.indicators?.length ? (
                <div className="indicator-grid">
                  {result.indicators.map((indicator, index) => (
                    <div
                      className="indicator-card"
                      key={`${indicator.type || "indicator"}-${index}`}
                    >
                      <div className="indicator-icon">
                        ⚠️
                      </div>

                      <div className="indicator-content">
                        <h4>
                          {indicator.title ||
                            indicator.type ||
                            "Security signal"}
                        </h4>

                        <p>
                          {indicator.description ||
                            "Security-related signal detected."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span>✓</span>
                  <p>No security indicators were detected.</p>
                </div>
              )}
            </div>

            {result.extracted_text && (
              <div className="extracted-card">
                <div className="card-title-row">
                  <div className="card-title-icon">📝</div>
                  <div>
                    <h3>Extracted Text</h3>
                    <p>Text processed from the document.</p>
                  </div>
                </div>

                <pre className="extracted-text">
                  {result.extracted_text}
                </pre>
              </div>
            )}

            {result.recommendation && (
              <div className="recommendation-card">
                <div className="recommendation-icon">🛡️</div>

                <div className="recommendation-content">
                  <h3>Recommended Action</h3>
                  <p>{result.recommendation}</p>
                </div>
              </div>
            )}

            {result.trust_chain && (
              <TrustChainBlock
                trustChain={result.trust_chain}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   TRUST CHAIN
   ========================================================= */

function TrustChainPage() {
  const steps = [
    {
      number: "01",
      icon: "🔍",
      title: "Detect",
      text: "Identify suspicious language, links, sensitive information, document signals, and other security indicators.",
    },
    {
      number: "02",
      icon: "🔗",
      title: "Connect",
      text: "Combine deterministic security rules with AI classification and the available context.",
    },
    {
      number: "03",
      icon: "🧠",
      title: "Explain",
      text: "Present the risk level, AI classification, confidence, probabilities, and supporting indicators.",
    },
    {
      number: "04",
      icon: "🛡️",
      title: "Protect",
      text: "Provide an actionable recommendation so the user can verify the request before acting.",
    },
  ];

  return (
    <div className="trust-page">
      <div className="trust-page-header">
        <span className="section-label">EXPLAINABLE SECURITY</span>

        <h1>Trust Chain</h1>

        <p>
          SnapGuard X is designed to show the path from a
          detected signal to a practical protection step.
        </p>
      </div>

      <div className="trust-large-flow">
        {steps.map((step, index) => (
          <Fragment key={step.number}>
            <div className="trust-large-step">
              <div className="trust-large-number">
                {step.number}
              </div>

              <div className="trust-large-icon">
                {step.icon}
              </div>

              <h2>{step.title}</h2>

              <p>{step.text}</p>
            </div>

            {index < steps.length - 1 && (
              <div
                className="trust-large-arrow"
                aria-hidden="true"
              >
                →
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <section className="analyzer-card trust-chain-card">
        <div className="card-title-row">
          <div className="card-title-icon">🧩</div>

          <div>
            <h2>How SnapGuard X Explains a Result</h2>
            <p>
              The interface keeps the analysis traceable instead
              of presenting only a final label.
            </p>
          </div>
        </div>

        <div className="trust-step">
          <span>1</span>
          <div>
            <strong>Security signals</strong>
            <p>
              Rules identify concrete patterns such as urgency,
              sensitive information, account pressure, or URL
              characteristics.
            </p>
          </div>
        </div>

        <div className="trust-step">
          <span>2</span>
          <div>
            <strong>AI classification</strong>
            <p>
              The trained text model classifies supported text as
              SAFE, SCAM, or SUSPICIOUS with a confidence value.
            </p>
          </div>
        </div>

        <div className="trust-step">
          <span>3</span>
          <div>
            <strong>Combined risk</strong>
            <p>
              The application combines rule signals and AI output
              to produce a 0–100 risk score and risk level.
            </p>
          </div>
        </div>

        <div className="trust-step">
          <span>4</span>
          <div>
            <strong>Protection guidance</strong>
            <p>
              The final recommendation focuses on safe verification
              before clicking, sharing credentials, or taking other
              sensitive actions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function TrustChainBlock({ trustChain }) {
  const labels = [
    ["detect", "🔍", "Detect"],
    ["connect", "🔗", "Connect"],
    ["explain", "🧠", "Explain"],
    ["protect", "🛡️", "Protect"],
  ];

  return (
    <div className="trust-chain">
      <div className="card-title-row">
        <div className="card-title-icon">🕸️</div>

        <div>
          <h3>Trust Chain</h3>
          <p>
            Trace how SnapGuard X reached the recommendation.
          </p>
        </div>
      </div>

      {labels.map(([key, icon, label]) => (
        <div className="trust-step" key={key}>
          <span>{icon}</span>

          <div>
            <strong>{label}</strong>
            <p>
              {trustChain?.[key] ||
                "Information unavailable for this step."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   HISTORY
   ========================================================= */

function HistoryPage({ history, onClear }) {
  return (
    <div className="history-page">
      <div className="history-page-header">
        <div>
          <span className="section-label">LOCAL ACTIVITY</span>

          <h2>Analysis Activity</h2>

          <p>
            Review your recent SnapGuard X security checks.
            Activity is stored locally in this browser.
          </p>
        </div>

        <div className="history-header-status">
          <span className="status-dot" />
          {history.length
            ? `${history.length} recorded`
            : "No activity yet"}
        </div>
      </div>

      <div className="analyzer-card history-card">
        <div className="history-card-header">
          <div className="history-title">
            <div className="card-title-icon">🕒</div>

            <div>
              <h2>Recent Analyses</h2>
              <p>
                {history.length
                  ? "Your latest security analysis results."
                  : "Your completed analyses will appear here."}
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              className="clear-button"
              onClick={onClear}
            >
              Clear History
            </button>
          )}
        </div>

        {!history.length ? (
          <div className="history-empty-state">
            <div className="history-empty-icon">🛡️</div>

            <h3>No analysis history</h3>

            <p>
              Run Message, URL, Image, Email, or Document
              Analyzer to start building your security history.
            </p>

            <div className="history-empty-features">
              <span>💬 Messages</span>
              <span>🔗 URLs</span>
              <span>🖼️ Images</span>
              <span>📧 Emails</span>
              <span>📄 Documents</span>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => {
              const level = item.riskLevel || "UNKNOWN";
              const levelClass =
                level === "HIGH"
                  ? "risk-high"
                  : level === "MEDIUM"
                  ? "risk-medium"
                  : level === "LOW"
                  ? "risk-low"
                  : "";

              return (
                <div className="history-item" key={item.id}>
                  <div className="history-item-icon">
                    {item.type === "Document"
                      ? "📄"
                      : item.type === "Email"
                      ? "📧"
                      : item.type === "Image"
                      ? "🖼️"
                      : item.type === "URL"
                      ? "🔗"
                      : "💬"}
                  </div>

                  <div className="history-item-content">
                    <strong>
                      {item.type || "Security Analysis"}
                    </strong>

                    <span>
                      {item.name ||
                        item.prediction ||
                        "Analysis completed"}
                    </span>

                    <small>{item.timestamp}</small>
                  </div>

                  <div
                    className={`history-item-risk ${levelClass}`}
                  >
                    <strong>{level}</strong>
                    <span>
                      {item.riskScore ?? "—"}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
