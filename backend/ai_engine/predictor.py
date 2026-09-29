import os
import joblib


# ============================================================
# MODEL LOCATION
# ============================================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "model",
    "snapguard_text_model.joblib"
)


# ============================================================
# LOAD MODEL
# ============================================================

model = None


def load_model():

    global model

    if model is None:

        if not os.path.exists(MODEL_PATH):

            raise FileNotFoundError(
                "SnapGuard AI model not found. "
                "Run train_model.py first."
            )

        model = joblib.load(
            MODEL_PATH
        )

    return model


# ============================================================
# PREDICT TEXT
# ============================================================

def predict_text(text):

    if not text or not text.strip():

        return {
            "prediction": "SAFE",
            "confidence": 0.0
        }

    loaded_model = load_model()

    prediction = loaded_model.predict(
        [text]
    )[0]

    probabilities = loaded_model.predict_proba(
        [text]
    )[0]

    classes = loaded_model.classes_

    confidence = max(
        probabilities
    )

    probability_map = {
        class_name: round(
            float(probability),
            4
        )
        for class_name, probability
        in zip(classes, probabilities)
    }

    return {
        "prediction": prediction,
        "confidence": round(
            float(confidence),
            4
        ),
        "probabilities": probability_map
    }