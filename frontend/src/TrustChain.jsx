import React from "react";

const TrustChain = () => {
  return (
    <div className="trust-page">

      <div className="analyzer-header">
        <div>
          <div className="analyzer-badge">
            EXPLAINABLE AI SECURITY
          </div>

          <h1>Trust Chain</h1>

          <p>
            Understand how SnapGuard X moves from detection
            to a practical security recommendation.
          </p>
        </div>
      </div>

      {/* Main Trust Chain */}
      <div className="trust-chain-main">

        {/* Detect */}
        <div className="trust-page-step">

          <div className="trust-page-number">
            01
          </div>

          <div className="trust-page-icon">
            🔍
          </div>

          <div className="trust-page-content">

            <div className="trust-page-label">
              STEP 01
            </div>

            <h2>Detect</h2>

            <p>
              SnapGuard X looks for security indicators
              in the submitted message, URL, image, email,
              or document.
            </p>

            <div className="trust-evidence">
              <span>🔎</span>
              <div>
                <strong>Security Signals</strong>
                <p>
                  Urgency, sensitive information requests,
                  suspicious links, account pressure,
                  financial language and other indicators.
                </p>
              </div>
            </div>

          </div>

        </div>

        <div className="trust-page-connector">
          ↓
        </div>

        {/* Connect */}
        <div className="trust-page-step">

          <div className="trust-page-number">
            02
          </div>

          <div className="trust-page-icon">
            🔗
          </div>

          <div className="trust-page-content">

            <div className="trust-page-label">
              STEP 02
            </div>

            <h2>Connect</h2>

            <p>
              The detected evidence is combined with
              rule-based security analysis and the trained
              ONNX AI classifier.
            </p>

            <div className="trust-evidence">
              <span>🧩</span>
              <div>
                <strong>Evidence Fusion</strong>
                <p>
                  Extracted content + security rules +
                  trained AI classification are combined
                  to calculate the risk assessment.
                </p>
              </div>
            </div>

          </div>

        </div>

        <div className="trust-page-connector">
          ↓
        </div>

        {/* Explain */}
        <div className="trust-page-step">

          <div className="trust-page-number">
            03
          </div>

          <div className="trust-page-icon">
            💡
          </div>

          <div className="trust-page-content">

            <div className="trust-page-label">
              STEP 03
            </div>

            <h2>Explain</h2>

            <p>
              Instead of showing only a number, SnapGuard X
              explains what was detected and how the AI
              classified the content.
            </p>

            <div className="trust-evidence">
              <span>🤖</span>
              <div>
                <strong>AI Explanation</strong>
                <p>
                  Shows the AI classification, confidence,
                  probability breakdown and detected
                  security indicators.
                </p>
              </div>
            </div>

          </div>

        </div>

        <div className="trust-page-connector">
          ↓
        </div>

        {/* Protect */}
        <div className="trust-page-step">

          <div className="trust-page-number">
            04
          </div>

          <div className="trust-page-icon">
            🛡️
          </div>

          <div className="trust-page-content">

            <div className="trust-page-label">
              STEP 04
            </div>

            <h2>Protect</h2>

            <p>
              SnapGuard X provides a clear recommendation
              so the user can make an informed decision
              before taking action.
            </p>

            <div className="trust-evidence">
              <span>✅</span>
              <div>
                <strong>Action Recommendation</strong>
                <p>
                  Verify the sender, destination and request
                  before sharing information, clicking links
                  or taking action.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Core Principle */}
      <div className="trust-principle-card">

        <div className="trust-principle-icon">
          🛡️
        </div>

        <div>
          <div className="trust-page-label">
            SNAPGUARD X PRINCIPLE
          </div>

          <h2>
            Explain Before You Trust
          </h2>

          <p>
            A security decision should be understandable.
            SnapGuard X connects evidence, AI analysis and
            recommendations so users can understand why
            content deserves attention.
          </p>
        </div>

      </div>

    </div>
  );
};

export default TrustChain;