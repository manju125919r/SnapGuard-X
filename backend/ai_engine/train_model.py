import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline


# ============================================================
# TRAINING DATA
# ============================================================

training_data = [

    # ---------------- SAFE ----------------

    (
        "Hello, how are you today?",
        "SAFE"
    ),
    (
        "The meeting is scheduled for tomorrow at 10 AM.",
        "SAFE"
    ),
    (
        "Your order has been delivered successfully.",
        "SAFE"
    ),
    (
        "Thank you for contacting our support team.",
        "SAFE"
    ),
    (
        "Your appointment is confirmed for Monday.",
        "SAFE"
    ),
    (
        "Your monthly statement is available in your account.",
        "SAFE"
    ),
    (
        "The project meeting has been moved to Friday.",
        "SAFE"
    ),
    (
        "Your application has been successfully submitted.",
        "SAFE"
    ),
    (
        "Please find the requested document attached.",
        "SAFE"
    ),
    (
        "Your package will arrive tomorrow.",
        "SAFE"
    ),

    # ---------------- SUSPICIOUS ----------------

    (
        "Please verify your account immediately.",
        "SUSPICIOUS"
    ),
    (
        "Your account requires verification.",
        "SUSPICIOUS"
    ),
    (
        "Please confirm your identity using this link.",
        "SUSPICIOUS"
    ),
    (
        "Your account may be suspended if you do not verify.",
        "SUSPICIOUS"
    ),
    (
        "Security alert please login and verify your account.",
        "SUSPICIOUS"
    ),
    (
        "Your account information needs to be updated.",
        "SUSPICIOUS"
    ),
    (
        "Click the link to confirm your account.",
        "SUSPICIOUS"
    ),
    (
        "Your security verification is required immediately.",
        "SUSPICIOUS"
    ),
    (
        "Please update your banking information.",
        "SUSPICIOUS"
    ),
    (
        "Verify your details to continue using the service.",
        "SUSPICIOUS"
    ),

    # ---------------- SCAM ----------------

    (
        "Congratulations you won a cash prize. Claim your reward now.",
        "SCAM"
    ),
    (
        "You have won a lottery prize. Send your bank details to receive money.",
        "SCAM"
    ),
    (
        "You are the lucky winner. Pay a small fee to claim your prize.",
        "SCAM"
    ),
    (
        "Your account will be blocked today. Send your OTP immediately.",
        "SCAM"
    ),
    (
        "Send your password and OTP to verify your account.",
        "SCAM"
    ),
    (
        "Click this link immediately to receive your free money.",
        "SCAM"
    ),
    (
        "Congratulations you have won 50000 rupees. Claim now.",
        "SCAM"
    ),
    (
        "Your bank account has been selected for a special reward.",
        "SCAM"
    ),
    (
        "Send your card number and CVV to receive the reward.",
        "SCAM"
    ),
    (
        "Urgent! Your account is compromised. Login using this link immediately.",
        "SCAM"
    ),
]


# ============================================================
# PREPARE DATA
# ============================================================

texts = [
    item[0]
    for item in training_data
]

labels = [
    item[1]
    for item in training_data
]


# ============================================================
# MACHINE LEARNING PIPELINE
# ============================================================

model = Pipeline([
    (
        "tfidf",
        TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),
            sublinear_tf=True
        )
    ),

    (
        "classifier",
        LogisticRegression(
            max_iter=1000,
            random_state=42
        )
    )
])


# ============================================================
# TRAIN MODEL
# ============================================================

print("Training SnapGuard X AI model...")

model.fit(
    texts,
    labels
)

print("Model training completed.")


# ============================================================
# SAVE MODEL
# ============================================================

model_directory = os.path.join(
    os.path.dirname(__file__),
    "model"
)

os.makedirs(
    model_directory,
    exist_ok=True
)

model_path = os.path.join(
    model_directory,
    "snapguard_text_model.joblib"
)

joblib.dump(
    model,
    model_path
)

print()
print("Model saved successfully:")
print(model_path)