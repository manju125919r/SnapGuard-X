import os
import re
from typing import List

import joblib
import pytesseract

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from pypdf import PdfReader

from ai_engine.onnx_model import predict_text_onnx


# ============================================================
# APP CONFIGURATION
# ============================================================

app = FastAPI(
    title="SnapGuard X API",
    description="AI-powered digital security analysis API",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PATH CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

JOBLIB_MODEL_PATH = os.path.join(
    BASE_DIR,
    "ai_engine",
    "model",
    "snapguard_text_model.joblib"
)


# ============================================================
# LOAD SKLEARN FALLBACK MODEL
# ============================================================

model = None

try:
    if os.path.exists(JOBLIB_MODEL_PATH):
        model = joblib.load(JOBLIB_MODEL_PATH)

        print("Sklearn fallback model loaded successfully.")
        print("Classes:", model.classes_)

    else:
        print("Sklearn fallback model not found.")

except Exception as error:
    print("Could not load sklearn fallback model:")
    print(error)


# ============================================================
# TESSERACT OCR CONFIGURATION
# ============================================================

TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

TESSERACT_READY = False

for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        TESSERACT_READY = True

        print("Tesseract OCR found:")
        print(path)

        break

if not TESSERACT_READY:
    print("Tesseract OCR not found.")


# ============================================================
# REQUEST MODELS
# ============================================================

class MessageRequest(BaseModel):
    message: str


class URLRequest(BaseModel):
    url: str


class EmailRequest(BaseModel):
    sender: str = ""
    subject: str = ""
    body: str = ""


# ============================================================
# RISK HELPERS
# ============================================================

def calculate_risk_level(score: int) -> str:

    if score >= 70:
        return "HIGH"

    if score >= 40:
        return "MEDIUM"

    return "LOW"


def calculate_verdict(score: int) -> str:

    if score >= 70:
        return "Potentially Suspicious"

    if score >= 40:
        return "Needs Verification"

    return "No Major Warning Signals"


# ============================================================
# AI MODEL
# ============================================================

def predict_text_ai(text: str):

    """
    Primary AI inference:
        ONNX Runtime

    Fallback:
        sklearn .joblib model
    """

    # --------------------------------------------------------
    # ONNX PRIMARY MODEL
    # --------------------------------------------------------

    try:

        result = predict_text_onnx(text)

        return {
            "ai_prediction": result["prediction"],

            "ai_confidence": round(
                result["confidence"],
                4
            ),

            "ai_probabilities": {
                key: round(
                    value,
                    4
                )
                for key, value
                in result["probabilities"].items()
            },

            "ai_status":
                "ONNX AI analysis completed"
        }

    except Exception as onnx_error:

        print(
            "ONNX inference failed."
        )

        print(
            "ONNX error:",
            onnx_error
        )

        print(
            "Using sklearn fallback."
        )


    # --------------------------------------------------------
    # SKLEARN FALLBACK
    # --------------------------------------------------------

    if model is None:

        return {
            "ai_prediction": "UNKNOWN",

            "ai_confidence": 0.0,

            "ai_probabilities": {},

            "ai_status":
                "AI model unavailable"
        }


    try:

        prediction = model.predict(
            [text]
        )[0]

        probabilities = model.predict_proba(
            [text]
        )[0]

        classes = model.classes_

        probability_map = {
            str(class_name): round(
                float(probability),
                4
            )

            for class_name, probability
            in zip(
                classes,
                probabilities
            )
        }

        confidence = float(
            max(probabilities)
        )

        return {
            "ai_prediction":
                str(prediction),

            "ai_confidence":
                round(
                    confidence,
                    4
                ),

            "ai_probabilities":
                probability_map,

            "ai_status":
                "Sklearn fallback analysis completed"
        }

    except Exception as fallback_error:

        print(
            "Sklearn fallback failed:"
        )

        print(
            fallback_error
        )

        return {
            "ai_prediction": "UNKNOWN",

            "ai_confidence": 0.0,

            "ai_probabilities": {},

            "ai_status":
                "AI analysis failed"
        }


# ============================================================
# COMBINE RULE + AI SCORES
# ============================================================

def combine_risk_scores(
    rule_score: int,
    ai_prediction: str,
    ai_confidence: float
) -> int:

    prediction = ai_prediction.upper()

    # --------------------------------------------------------
    # Convert AI prediction into a risk contribution
    # --------------------------------------------------------

    if prediction == "SCAM":

        ai_score = round(
            ai_confidence * 60
        )

    elif prediction == "SUSPICIOUS":

        ai_score = round(
            ai_confidence * 35
        )

    else:

        ai_score = 0


    # --------------------------------------------------------
    # Weighted combination
    # --------------------------------------------------------

    combined_score = round(
        (rule_score * 0.55)
        +
        (ai_score * 0.45)
    )


    # --------------------------------------------------------
    # Strong SCAM signal protection
    # --------------------------------------------------------

    if (
        prediction == "SCAM"
        and ai_confidence >= 0.50
    ):

        combined_score = max(
            combined_score,
            70
        )


    return min(
        100,
        max(
            0,
            combined_score
        )
    )


# ============================================================
# MESSAGE RULE ANALYZER
# ============================================================

def analyze_message_rules(message: str):

    text = message.lower()

    score = 0

    indicators = []


    # --------------------------------------------------------
    # Reward / Prize
    # --------------------------------------------------------

    reward_keywords = [
        "won",
        "winner",
        "prize",
        "reward",
        "lottery",
        "cash prize",
        "gift",
        "bonus",
        "congratulations"
    ]

    if any(
        keyword in text
        for keyword in reward_keywords
    ):

        score += 25

        indicators.append({
            "type": "reward_language",

            "title":
                "Reward or prize language detected",

            "description":
                "The message contains language commonly used to attract attention through prizes, rewards, or unexpected benefits."
        })


    # --------------------------------------------------------
    # Urgency
    # --------------------------------------------------------

    urgency_keywords = [
        "urgent",
        "immediately",
        "act now",
        "right now",
        "within 24 hours",
        "expires today",
        "last chance",
        "hurry",
        "quickly"
    ]

    if any(
        keyword in text
        for keyword in urgency_keywords
    ):

        score += 20

        indicators.append({
            "type": "urgency",

            "title":
                "Urgency pressure detected",

            "description":
                "The message tries to make the recipient act quickly instead of taking time to verify the request."
        })


    # --------------------------------------------------------
    # Sensitive information
    # --------------------------------------------------------

    sensitive_keywords = [
        "password",
        "otp",
        "one time password",
        "cvv",
        "pin",
        "credit card",
        "debit card",
        "bank account",
        "account number",
        "aadhaar",
        "pan number"
    ]

    if any(
        keyword in text
        for keyword in sensitive_keywords
    ):

        score += 30

        indicators.append({
            "type": "sensitive_information",

            "title":
                "Sensitive information request detected",

            "description":
                "The message appears to request or reference sensitive credentials or financial information."
        })


    # --------------------------------------------------------
    # External links
    # --------------------------------------------------------

    url_pattern = r"https?://[^\s]+|www\.[^\s]+"

    if re.search(
        url_pattern,
        text
    ):

        score += 15

        indicators.append({
            "type": "external_link",

            "title":
                "External link detected",

            "description":
                "The message contains a link that should be verified before opening."
        })


    # --------------------------------------------------------
    # Account pressure
    # --------------------------------------------------------

    account_keywords = [
        "account blocked",
        "account suspended",
        "verify your account",
        "verify account",
        "account will be closed",
        "login immediately",
        "confirm your identity"
    ]

    if any(
        keyword in text
        for keyword in account_keywords
    ):

        score += 15

        indicators.append({
            "type": "account_pressure",

            "title":
                "Account pressure detected",

            "description":
                "The message creates pressure around account access or identity verification."
        })


    score = min(
        score,
        100
    )


    return score, indicators


# ============================================================
# URL ANALYZER
# ============================================================

def analyze_url_rules(url: str):

    score = 0

    indicators = []

    lower_url = url.lower()


    # --------------------------------------------------------
    # HTTPS
    # --------------------------------------------------------

    if lower_url.startswith("https://"):

        indicators.append({
            "type": "https",

            "title":
                "HTTPS connection detected",

            "description":
                "The URL uses HTTPS. This protects the connection but does not by itself prove that the website is trustworthy."
        })

    else:

        score += 15

        indicators.append({
            "type": "no_https",

            "title":
                "HTTPS not detected",

            "description":
                "The URL does not use HTTPS."
        })


    # --------------------------------------------------------
    # IP address
    # --------------------------------------------------------

    ip_pattern = (
        r"(?:\d{1,3}\.){3}\d{1,3}"
    )

    if re.search(
        ip_pattern,
        lower_url
    ):

        score += 25

        indicators.append({
            "type": "ip_address",

            "title":
                "IP address used instead of domain",

            "description":
                "The URL uses a raw IP address, which can make the destination harder to identify."
        })


    # --------------------------------------------------------
    # Suspicious keywords
    # --------------------------------------------------------

    suspicious_keywords = [
        "login",
        "verify",
        "verification",
        "secure",
        "account",
        "update",
        "password",
        "payment",
        "confirm"
    ]

    matched_keywords = [
        keyword

        for keyword in suspicious_keywords

        if keyword in lower_url
    ]

    if matched_keywords:

        score += 15

        indicators.append({
            "type": "suspicious_keywords",

            "title":
                "Security-sensitive keywords detected",

            "description":
                "The URL contains keywords commonly associated with account, verification, or payment workflows."
        })


    # --------------------------------------------------------
    # Long URL
    # --------------------------------------------------------

    if len(url) > 100:

        score += 10

        indicators.append({
            "type": "long_url",

            "title":
                "Long URL detected",

            "description":
                "The URL is unusually long and may contain additional parameters or tracking information."
        })


    # --------------------------------------------------------
    # Multiple subdomains
    # --------------------------------------------------------

        # --------------------------------------------------------
    # Multiple subdomains
    # --------------------------------------------------------

    domain_part = re.sub(
        r"^https?://",
        "",
        lower_url
    ).split("/")[0]

    # Remove port number if present
    domain_part = domain_part.split(":")[0]

    # Do not treat IPv4 addresses as domains/subdomains
    is_ipv4 = re.fullmatch(
        r"(?:\d{1,3}\.){3}\d{1,3}",
        domain_part
    )

    if not is_ipv4 and domain_part.count(".") >= 3:

        score += 10

        indicators.append({
            "type": "multiple_subdomains",

            "title":
                "Multiple subdomains detected",

            "description":
                "The domain contains several subdomain levels and should be checked carefully."
        })

    # --------------------------------------------------------
    # Encoded characters
    # --------------------------------------------------------

    if "%" in url:

        score += 10

        indicators.append({
            "type": "encoded_characters",

            "title":
                "Encoded URL characters detected",

            "description":
                "The URL contains percent-encoded characters."
        })


    # --------------------------------------------------------
    # @ symbol
    # --------------------------------------------------------

    if "@" in url:

        score += 20

        indicators.append({
            "type": "at_symbol",

            "title":
                "@ symbol detected",

            "description":
                "The URL contains an @ symbol, which can make the actual destination harder to identify."
        })


    # --------------------------------------------------------
    # Many hyphens
    # --------------------------------------------------------

    if url.count("-") >= 3:

        score += 10

        indicators.append({
            "type": "many_hyphens",

            "title":
                "Multiple hyphens detected",

            "description":
                "The domain contains several hyphens and should be checked carefully."
        })


    score = min(
        score,
        100
    )


    return score, indicators


# ============================================================
# RECOMMENDATION GENERATOR
# ============================================================

def generate_recommendation(
    risk_level: str,
    indicators: List[dict]
):

    if risk_level == "HIGH":

        return (
            "Do not click links, share credentials, "
            "send money, or provide sensitive information. "
            "Verify the sender or website through an official channel."
        )


    if risk_level == "MEDIUM":

        return (
            "Treat this content carefully. "
            "Verify the sender, destination, and request "
            "before taking action."
        )


    return (
        "No major warning signals were detected. "
        "Still verify unexpected requests before taking action."
    )


# ============================================================
# TRUST CHAIN
# ============================================================

def build_trust_chain(
    indicators,
    ai_prediction,
    ai_confidence,
    recommendation
):

    return {

        "detect":
            f"{len(indicators)} security indicator(s) detected.",

        "connect":
            "Rule-based signals were combined with the trained text classification model.",

        "explain":
            (
                f"AI classified the content as "
                f"{ai_prediction} with "
                f"{ai_confidence * 100:.2f}% confidence."
            ),

        "protect":
            recommendation
    }


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():

    return {
        "name": "SnapGuard X",

        "status": "running",

        "message":
            "AI security analysis backend is active."
    }


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health")
def health():

    return {

        "status": "healthy",

        "ai_model": "ONNX",

        "onnx_status": "READY",

        "sklearn_fallback":
            "READY" if model is not None else "NOT AVAILABLE",

        "tesseract":
            "READY" if TESSERACT_READY else "NOT AVAILABLE"
    }


# ============================================================
# AI MODEL STATUS
# ============================================================

@app.get("/ai-model-status")
def ai_model_status():

    return {

        "primary_model":
            "SnapGuard Text ONNX Model",

        "primary_runtime":
            "ONNX Runtime",

        "provider":
            "CPUExecutionProvider",

        "status":
            "READY",

        "fallback":
            "scikit-learn Joblib",

        "classes": [
            "SAFE",
            "SCAM",
            "SUSPICIOUS"
        ]
    }


# ============================================================
# ANALYZE MESSAGE
# ============================================================

@app.post("/analyze-message")
def analyze_message(
    request: MessageRequest
):

    message = request.message.strip()


    if not message:

        return {
            "status": "error",

            "message":
                "Message cannot be empty."
        }


    # --------------------------------------------------------
    # Rule analysis
    # --------------------------------------------------------

    rule_score, indicators = (
        analyze_message_rules(
            message
        )
    )


    # --------------------------------------------------------
    # AI analysis
    # --------------------------------------------------------

    ai_result = predict_text_ai(
        message
    )


    ai_prediction = (
        ai_result["ai_prediction"]
    )

    ai_confidence = (
        ai_result["ai_confidence"]
    )


    # --------------------------------------------------------
    # Combined risk
    # --------------------------------------------------------

    risk_score = combine_risk_scores(
        rule_score,
        ai_prediction,
        ai_confidence
    )


    risk_level = calculate_risk_level(
        risk_score
    )

    verdict = calculate_verdict(
        risk_score
    )


    # --------------------------------------------------------
    # Recommendation
    # --------------------------------------------------------

    recommendation = generate_recommendation(
        risk_level,
        indicators
    )


    # --------------------------------------------------------
    # Trust Chain
    # --------------------------------------------------------

    trust_chain = build_trust_chain(
        indicators,
        ai_prediction,
        ai_confidence,
        recommendation
    )


    return {

        "status":
            "success",

        "input_type":
            "message",

        "message":
            message,

        "verdict":
            verdict,

        "risk_level":
            risk_level,

        "risk_score":
            risk_score,

        "rule_score":
            rule_score,

        "ai_prediction":
            ai_prediction,

        "ai_confidence":
            ai_confidence,

        "ai_probabilities":
            ai_result["ai_probabilities"],

        "ai_status":
            ai_result["ai_status"],

        "detected_urls":
            re.findall(
                r"https?://[^\s]+|www\.[^\s]+",
                message
            ),

        "indicators":
            indicators,

        "recommendation":
            recommendation,

        "trust_chain":
            trust_chain
    }


# ============================================================
# ANALYZE URL
# ============================================================

@app.post("/analyze-url")
def analyze_url(
    request: URLRequest
):

    url = request.url.strip()


    if not url:

        return {
            "status": "error",

            "message":
                "URL cannot be empty."
        }


    # --------------------------------------------------------
    # Rule analysis
    # --------------------------------------------------------

    rule_score, indicators = (
        analyze_url_rules(
            url
        )
    )


    risk_score = rule_score

    risk_level = calculate_risk_level(
        risk_score
    )

    verdict = calculate_verdict(
        risk_score
    )


    recommendation = generate_recommendation(
        risk_level,
        indicators
    )


    trust_chain = {

        "detect":
            f"{len(indicators)} URL security indicator(s) detected.",

        "connect":
            "URL characteristics were evaluated against SnapGuard X security rules.",

        "explain":
            f"The URL received a rule-based risk score of {risk_score}/100.",

        "protect":
            recommendation
    }


    return {

        "status":
            "success",

        "input_type":
            "url",

        "url":
            url,

        "verdict":
            verdict,

        "risk_level":
            risk_level,

        "risk_score":
            risk_score,

        "rule_score":
            rule_score,

        "detected_urls":
            [url],

        "indicators":
            indicators,

        "recommendation":
            recommendation,

        "trust_chain":
            trust_chain
    }


# ============================================================
# ANALYZE EMAIL
# ============================================================

@app.post("/analyze-email")
def analyze_email(request: EmailRequest):

    sender = request.sender.strip()
    subject = request.subject.strip()
    body = request.body.strip()

    if not sender and not subject and not body:
        return {
            "status": "error",
            "message": "Email content cannot be empty."
        }

    combined_text = (
        f"Sender: {sender}\n"
        f"Subject: {subject}\n"
        f"Body: {body}"
    ).strip()

    text_lower = combined_text.lower()
    rule_score = 0
    indicators = []

    urgency_keywords = [
        "urgent", "immediately", "act now", "right now",
        "within 24 hours", "expires today", "last warning",
        "final notice", "hurry"
    ]
    if any(keyword in text_lower for keyword in urgency_keywords):
        rule_score += 20
        indicators.append({
            "type": "email_urgency",
            "title": "Urgency pressure detected",
            "description": "The email uses time-pressure language that may encourage the recipient to act before verifying the request."
        })

    sensitive_keywords = [
        "password", "otp", "one time password", "verification code",
        "cvv", "pin", "credit card", "debit card", "bank account",
        "account number", "login details", "security code"
    ]
    if any(keyword in text_lower for keyword in sensitive_keywords):
        rule_score += 30
        indicators.append({
            "type": "email_sensitive_information",
            "title": "Sensitive information referenced",
            "description": "The email references credentials, financial information, verification codes, or other sensitive information."
        })

    account_keywords = [
        "account suspended", "account blocked", "verify your account",
        "verify account", "account will be closed", "login immediately",
        "confirm your identity", "unusual activity", "security alert"
    ]
    if any(keyword in text_lower for keyword in account_keywords):
        rule_score += 15
        indicators.append({
            "type": "email_account_pressure",
            "title": "Account or security pressure detected",
            "description": "The email creates pressure around account access, verification, or security activity."
        })

    reward_keywords = [
        "you won", "winner", "prize", "reward", "lottery",
        "cash prize", "claim your money", "bonus", "gift"
    ]
    if any(keyword in text_lower for keyword in reward_keywords):
        rule_score += 25
        indicators.append({
            "type": "email_reward",
            "title": "Unexpected reward or prize language",
            "description": "The email contains prize, reward, lottery, or unexpected money-related claims."
        })

    detected_urls = re.findall(r"https?://[^\s]+|www\.[^\s]+", combined_text)
    if detected_urls:
        rule_score += 15
        indicators.append({
            "type": "email_external_link",
            "title": "External link detected",
            "description": f"The email contains {len(detected_urls)} external link(s). Verify destinations before opening them."
        })

    if sender:
        sender_lower = sender.lower()
        suspicious_sender_terms = ["noreply", "support", "security", "verify", "admin", "account"]
        if any(term in sender_lower for term in suspicious_sender_terms):
            indicators.append({
                "type": "sender_context",
                "title": "Security-related sender wording",
                "description": "The sender address contains security or account-related wording. This alone does not prove that the sender is malicious."
            })

    rule_score = min(rule_score, 100)

    ai_result = predict_text_ai(combined_text)
    ai_prediction = ai_result["ai_prediction"]
    ai_confidence = ai_result["ai_confidence"]

    risk_score = combine_risk_scores(rule_score, ai_prediction, ai_confidence)
    risk_level = calculate_risk_level(risk_score)
    verdict = calculate_verdict(risk_score)

    recommendation = generate_recommendation(risk_level, indicators)

    trust_chain = {
        "detect": f"{len(indicators)} email security indicator(s) detected.",
        "connect": "Sender context, subject, body signals, URLs, security rules, and the trained AI classifier were combined.",
        "explain": f"AI classified the email as {ai_prediction} with {ai_confidence * 100:.2f}% confidence. The combined risk score is {risk_score}/100.",
        "protect": recommendation
    }

    return {
        "status": "success",
        "input_type": "email",
        "sender": sender,
        "subject": subject,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "verdict": verdict,
        "rule_score": rule_score,
        "ai_prediction": ai_prediction,
        "ai_confidence": ai_confidence,
        "ai_probabilities": ai_result["ai_probabilities"],
        "ai_status": ai_result["ai_status"],
        "detected_urls": detected_urls,
        "indicators": indicators,
        "recommendation": recommendation,
        "trust_chain": trust_chain
    }


# ============================================================
# ANALYZE IMAGE
# ============================================================

@app.post("/analyze-image")
async def analyze_image(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate file
    # --------------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ]

    if file.content_type not in allowed_types:

        return {
            "status": "error",

            "message":
                "Unsupported image format. "
                "Use JPG, JPEG, PNG, or WEBP."
        }


    try:

        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        image_bytes = await file.read()

        from io import BytesIO

        image = Image.open(
            BytesIO(image_bytes)
        )


        # ----------------------------------------------------
        # OCR
        # ----------------------------------------------------

        if not TESSERACT_READY:

            return {
                "status":
                    "error",

                "message":
                    "Tesseract OCR is not available."
            }


        extracted_text = (
            pytesseract.image_to_string(
                image
            ).strip()
        )


        # ----------------------------------------------------
        # No text detected
        # ----------------------------------------------------

        if not extracted_text:

            indicators = [

                {
                    "type":
                        "ocr_empty",

                    "title":
                        "No readable text detected",

                    "description":
                        "SnapGuard X could not extract readable text from the uploaded image."
                }

            ]

            recommendation = (
                "Try uploading a clearer image "
                "or verify the content manually."
            )


            return {

                "status":
                    "success",

                "input_type":
                    "image",

                "filename":
                    file.filename,

                "extracted_text":
                    "",

                "detected_urls":
                    [],

                "verdict":
                    "Needs Verification",

                "risk_level":
                    "MEDIUM",

                "risk_score":
                    55,

                "rule_score":
                    55,

                "ai_prediction":
                    "UNKNOWN",

                "ai_confidence":
                    0.0,

                "ai_probabilities":
                    {},

                "ai_status":
                    "No readable OCR text",

                "indicators":
                    indicators,

                "recommendation":
                    recommendation,

                "trust_chain": {

                    "detect":
                        "No readable text was detected.",

                    "connect":
                        "Image content could not be reliably connected to text-based indicators.",

                    "explain":
                        "The image requires manual verification.",

                    "protect":
                        recommendation
                }
            }


        # ----------------------------------------------------
        # Message-style rule analysis
        # ----------------------------------------------------

        rule_score, indicators = (
            analyze_message_rules(
                extracted_text
            )
        )


        # ----------------------------------------------------
        # Identity document indicators
        # ----------------------------------------------------

        lower_text = extracted_text.lower()

        identity_keywords = [
            "aadhaar",
            "pan card",
            "passport",
            "driving licence",
            "driving license",
            "identity card",
            "id card",
            "government of india",
            "date of birth"
        ]

        if any(
            keyword in lower_text
            for keyword in identity_keywords
        ):

            rule_score += 15

            indicators.append({

                "type":
                    "identity_document",

                "title":
                    "Identity document detected",

                "description":
                    "The image appears to contain identity-document information. Handle this information carefully and avoid sharing it unnecessarily."
            })


        # ----------------------------------------------------
        # OTP detection
        # ----------------------------------------------------

        otp_pattern = (
            r"\b\d{4,8}\b"
        )

        if (
            re.search(
                otp_pattern,
                extracted_text
            )
            and
            "otp" in lower_text
        ):

            rule_score += 20

            indicators.append({

                "type":
                    "otp",

                "title":
                    "OTP-related information detected",

                "description":
                    "The image appears to contain an OTP or verification code. Never share verification codes with untrusted parties."
            })


        rule_score = min(
            rule_score,
            100
        )


        # ----------------------------------------------------
        # AI analysis
        # ----------------------------------------------------

        ai_result = predict_text_ai(
            extracted_text
        )


        ai_prediction = (
            ai_result["ai_prediction"]
        )

        ai_confidence = (
            ai_result["ai_confidence"]
        )


        # ----------------------------------------------------
        # Combined risk
        # ----------------------------------------------------

        risk_score = combine_risk_scores(
            rule_score,
            ai_prediction,
            ai_confidence
        )


        risk_level = calculate_risk_level(
            risk_score
        )

        verdict = calculate_verdict(
            risk_score
        )


        # ----------------------------------------------------
        # URLs
        # ----------------------------------------------------

        detected_urls = re.findall(
            r"https?://[^\s]+|www\.[^\s]+",
            extracted_text
        )


        # ----------------------------------------------------
        # Recommendation
        # ----------------------------------------------------

        recommendation = generate_recommendation(
            risk_level,
            indicators
        )


        # ----------------------------------------------------
        # Trust Chain
        # ----------------------------------------------------

        trust_chain = build_trust_chain(
            indicators,
            ai_prediction,
            ai_confidence,
            recommendation
        )


        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        return {

            "status":
                "success",

            "input_type":
                "image",

            "filename":
                file.filename,

            "extracted_text":
                extracted_text,

            "detected_urls":
                detected_urls,

            "verdict":
                verdict,

            "risk_level":
                risk_level,

            "risk_score":
                risk_score,

            "rule_score":
                rule_score,

            "ai_prediction":
                ai_prediction,

            "ai_confidence":
                ai_confidence,

            "ai_probabilities":
                ai_result[
                    "ai_probabilities"
                ],

            "ai_status":
                ai_result[
                    "ai_status"
                ],

            "indicators":
                indicators,

            "recommendation":
                recommendation,

            "trust_chain":
                trust_chain
        }


    except Exception as error:

        print(
            "Image analysis error:",
            error
        )

        return {

            "status":
                "error",

            "message":
                f"Image analysis failed: {str(error)}"
        }

# ============================================================
# ANALYZE DOCUMENT
# ============================================================

@app.post("/analyze-document")
async def analyze_document(
    file: UploadFile = File(...)
):

    # --------------------------------------------------------
    # Validate document
    # --------------------------------------------------------

    allowed_types = [
        "application/pdf",
        "text/plain"
    ]

    filename = file.filename or ""

    extension = os.path.splitext(
        filename
    )[1].lower()

    if (
        file.content_type not in allowed_types
        and extension not in [".pdf", ".txt"]
    ):

        return {
            "status": "error",
            "message":
                "Unsupported document format. "
                "Use PDF or TXT files."
        }

    try:

        # ----------------------------------------------------
        # Read uploaded document
        # ----------------------------------------------------

        file_bytes = await file.read()

        if not file_bytes:

            return {
                "status": "error",
                "message":
                    "The uploaded document is empty."
            }

        # ----------------------------------------------------
        # Extract text
        # ----------------------------------------------------

        extracted_text = ""

        pages = 1

        # ----------------------------------------------------
        # PDF
        # ----------------------------------------------------

        if (
            extension == ".pdf"
            or file.content_type == "application/pdf"
        ):

            from io import BytesIO

            pdf_stream = BytesIO(
                file_bytes
            )

            reader = PdfReader(
                pdf_stream
            )

            pages = len(
                reader.pages
            )

            extracted_pages = []

            for page in reader.pages:

                try:

                    page_text = (
                        page.extract_text()
                        or ""
                    )

                    extracted_pages.append(
                        page_text
                    )

                except Exception as error:

                    print(
                        "PDF page extraction error:",
                        error
                    )

            extracted_text = "\n".join(
                extracted_pages
            ).strip()

        # ----------------------------------------------------
        # TXT
        # ----------------------------------------------------

        elif (
            extension == ".txt"
            or file.content_type == "text/plain"
        ):

            extracted_text = (
                file_bytes
                .decode(
                    "utf-8",
                    errors="ignore"
                )
                .strip()
            )

        # ----------------------------------------------------
        # No readable text
        # ----------------------------------------------------

        if not extracted_text:

            recommendation = (
                "No readable text was found. "
                "Try a text-based PDF or TXT file. "
                "Scanned PDFs may require OCR."
            )

            return {

                "status":
                    "success",

                "input_type":
                    "document",

                "filename":
                    filename,

                "document_type":
                    extension.replace(
                        ".",
                        ""
                    ).upper(),

                "pages":
                    pages,

                "extracted_text":
                    "",

                "detected_urls":
                    [],

                "verdict":
                    "Needs Verification",

                "risk_level":
                    "MEDIUM",

                "risk_score":
                    50,

                "rule_score":
                    50,

                "ai_prediction":
                    "UNKNOWN",

                "ai_confidence":
                    0.0,

                "ai_probabilities":
                    {},

                "ai_status":
                    "No readable document text",

                "indicators": [

                    {
                        "type":
                            "document_no_text",

                        "title":
                            "No readable text detected",

                        "description":
                            "SnapGuard X could not extract readable text from the uploaded document."
                    }

                ],

                "recommendation":
                    recommendation,

                "trust_chain": {

                    "detect":
                        "No readable document text was detected.",

                    "connect":
                        "Document extraction could not provide text for security analysis.",

                    "explain":
                        "The document requires manual verification or OCR before deeper analysis.",

                    "protect":
                        recommendation
                }
            }

        # ----------------------------------------------------
        # Limit text size
        # ----------------------------------------------------

        max_text_length = 20000

        analysis_text = (
            extracted_text[
                :max_text_length
            ]
        )

        # ----------------------------------------------------
        # Rule analysis
        # ----------------------------------------------------

        rule_score, indicators = (
            analyze_message_rules(
                analysis_text
            )
        )

        # ----------------------------------------------------
        # Document-specific checks
        # ----------------------------------------------------

        document_lower = (
            analysis_text.lower()
        )

        # ----------------------------------------------------
        # Financial information
        # ----------------------------------------------------

        financial_terms = [

            "bank account",
            "account number",
            "credit card",
            "debit card",
            "payment",
            "wire transfer",
            "transfer money",
            "upi",
            "refund"

        ]

        if any(
            term in document_lower
            for term in financial_terms
        ):

            rule_score += 15

            indicators.append({

                "type":
                    "document_financial_request",

                "title":
                    "Financial information referenced",

                "description":
                    "The document contains payment or financial-account language that should be verified carefully."
            })

        # ----------------------------------------------------
        # Credentials
        # ----------------------------------------------------

        credential_terms = [

            "password",
            "passcode",
            "otp",
            "one time password",
            "verification code",
            "login",
            "username"

        ]

        if any(
            term in document_lower
            for term in credential_terms
        ):

            rule_score += 15

            indicators.append({

                "type":
                    "document_credentials",

                "title":
                    "Credentials or verification codes referenced",

                "description":
                    "The document references credentials or verification information."
            })

        # ----------------------------------------------------
        # Urgency
        # ----------------------------------------------------

        urgency_terms = [

            "urgent",
            "immediately",
            "within 24 hours",
            "act now",
            "deadline",
            "expires today",
            "final notice",
            "suspended"

        ]

        if any(
            term in document_lower
            for term in urgency_terms
        ):

            rule_score += 10

            indicators.append({

                "type":
                    "document_urgency",

                "title":
                    "Urgency language detected",

                "description":
                    "The document uses time-pressure language that may encourage action before verification."
            })

        # ----------------------------------------------------
        # Detect URLs
        # ----------------------------------------------------

        detected_urls = re.findall(
            r"https?://[^\s]+|www\.[^\s]+",
            analysis_text
        )

        if detected_urls:

            indicators.append({

                "type":
                    "document_external_links",

                "title":
                    "External links detected",

                "description":
                    f"The document contains {len(detected_urls)} link(s). Verify destinations before opening them."
            })

        # ----------------------------------------------------
        # Cap rule score
        # ----------------------------------------------------

        rule_score = min(
            rule_score,
            100
        )

        # ----------------------------------------------------
        # ONNX AI
        # ----------------------------------------------------

        ai_result = predict_text_ai(
            analysis_text
        )

        ai_prediction = (
            ai_result[
                "ai_prediction"
            ]
        )

        ai_confidence = (
            ai_result[
                "ai_confidence"
            ]
        )

        # ----------------------------------------------------
        # Combined risk
        # ----------------------------------------------------

        risk_score = combine_risk_scores(
            rule_score,
            ai_prediction,
            ai_confidence
        )

        risk_level = calculate_risk_level(
            risk_score
        )

        verdict = calculate_verdict(
            risk_score
        )

        # ----------------------------------------------------
        # Recommendation
        # ----------------------------------------------------

        recommendation = (
            generate_recommendation(
                risk_level,
                indicators
            )
        )

        # ----------------------------------------------------
        # Trust Chain
        # ----------------------------------------------------

        trust_chain = {

            "detect":
                f"{len(indicators)} document security indicator(s) detected.",

            "connect":
                "Document text, extracted links, security rules, and the trained ONNX AI classifier were combined.",

            "explain":
                (
                    f"AI classified the document as "
                    f"{ai_prediction} with "
                    f"{ai_confidence * 100:.2f}% confidence. "
                    f"The combined risk score is "
                    f"{risk_score}/100."
                ),

            "protect":
                recommendation
        }

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return {

            "status":
                "success",

            "input_type":
                "document",

            "filename":
                filename,

            "document_type":
                extension.replace(
                    ".",
                    ""
                ).upper(),

            "pages":
                pages,

            "extracted_text":
                extracted_text,

            "detected_urls":
                detected_urls,

            "verdict":
                verdict,

            "risk_level":
                risk_level,

            "risk_score":
                risk_score,

            "rule_score":
                rule_score,

            "ai_prediction":
                ai_prediction,

            "ai_confidence":
                ai_confidence,

            "ai_probabilities":
                ai_result[
                    "ai_probabilities"
                ],

            "ai_status":
                ai_result[
                    "ai_status"
                ],

            "indicators":
                indicators,

            "recommendation":
                recommendation,

            "trust_chain":
                trust_chain
        }

    except Exception as error:

        print(
            "Document analysis error:",
            error
        )

        return {

            "status":
                "error",

            "message":
                f"Document analysis failed: {str(error)}"
        }
# ============================================================
# STARTUP
# ============================================================

@app.on_event("startup")
def startup_event():

    print()
    print("=" * 60)
    print("SNAPGUARD X BACKEND")
    print("=" * 60)

    print(
        "API: http://127.0.0.1:8000"
    )

    print(
        "Docs: http://127.0.0.1:8000/docs"
    )

    print()

    print(
        "AI Model: ONNX"
    )

    print(
        "ONNX Runtime: READY"
    )

    print(
        "ONNX Provider: CPUExecutionProvider"
    )

    print(
        "Sklearn Fallback:",
        "READY" if model is not None
        else "NOT AVAILABLE"
    )

    print(
        "Classes:",
        ["SAFE", "SCAM", "SUSPICIOUS"]
    )

    print(
        "Tesseract OCR:",
        "READY" if TESSERACT_READY
        else "NOT AVAILABLE"
    )

    print()

    print(
        "SnapGuard X backend running."
    )

    print("=" * 60)
    print()