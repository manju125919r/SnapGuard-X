import os
import joblib

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.joblib"
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_classifier.onnx"
)


# ---------------------------------------------------------
# Load trained pipeline
# ---------------------------------------------------------

print("Loading SnapGuard X trained model...")
print("------------------------------------")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully.")
print(model)


# ---------------------------------------------------------
# Extract Logistic Regression classifier
# ---------------------------------------------------------

tfidf = model.named_steps["tfidf"]
classifier = model.named_steps["classifier"]

feature_count = len(tfidf.vocabulary_)

print("\nTF-IDF feature count:")
print(feature_count)

print("\nClassifier:")
print(classifier)

print("\nClasses:")
print(classifier.classes_)


# ---------------------------------------------------------
# Convert Logistic Regression to ONNX
# ---------------------------------------------------------

print("\nConverting classifier to ONNX...")
print("--------------------------------")

initial_type = [
    (
        "features",
        FloatTensorType([None, feature_count])
    )
]

onnx_model = convert_sklearn(
    classifier,
    initial_types=initial_type,
    target_opset=17
)


# ---------------------------------------------------------
# Save ONNX model
# ---------------------------------------------------------

with open(OUTPUT_PATH, "wb") as f:
    f.write(onnx_model.SerializeToString())


print("\nONNX conversion completed successfully.")

print("\nModel saved to:")
print(OUTPUT_PATH)

print("\nInput:")
print(f"features -> float32 [None, {feature_count}]")

print("\nClasses:")
print(classifier.classes_)

print("\nSnapGuard X Snapdragon-compatible classifier created.")