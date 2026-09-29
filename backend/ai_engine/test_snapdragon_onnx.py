import os
import joblib
import numpy as np
import onnxruntime as ort


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.joblib"
)

ONNX_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_snapdragon.onnx"
)


# ---------------------------------------------------------
# Test message
# ---------------------------------------------------------

text = (
    "Congratulations! You won a prize. "
    "Click this link immediately to claim your reward."
)


# ---------------------------------------------------------
# Load original model
# ---------------------------------------------------------

print("Loading original SnapGuard model...")
print("-----------------------------------")

pipeline = joblib.load(MODEL_PATH)

tfidf = pipeline.named_steps["tfidf"]
classifier = pipeline.named_steps["classifier"]


# ---------------------------------------------------------
# TF-IDF preprocessing
# ---------------------------------------------------------

features = tfidf.transform([text]).toarray().astype(np.float32)

print("\nTF-IDF features:")
print("Shape:", features.shape)
print("Dtype:", features.dtype)


# ---------------------------------------------------------
# Original sklearn prediction
# ---------------------------------------------------------

sklearn_probabilities = classifier.predict_proba(features)[0]

sklearn_index = np.argmax(sklearn_probabilities)
sklearn_prediction = classifier.classes_[sklearn_index]

print("\nOriginal sklearn model:")
print("Prediction:", sklearn_prediction)
print("Probabilities:")

for class_name, probability in zip(
    classifier.classes_,
    sklearn_probabilities
):
    print(
        f"  {class_name}: "
        f"{probability:.8f}"
    )


# ---------------------------------------------------------
# Load Snapdragon ONNX model
# ---------------------------------------------------------

print("\nLoading Snapdragon-compatible ONNX model...")
print("--------------------------------------------")

session = ort.InferenceSession(
    ONNX_PATH,
    providers=["CPUExecutionProvider"]
)

print("ONNX model loaded.")

print("\nONNX Inputs:")

for item in session.get_inputs():
    print(
        "Name:", item.name,
        "| Type:", item.type,
        "| Shape:", item.shape
    )

print("\nONNX Outputs:")

for item in session.get_outputs():
    print(
        "Name:", item.name,
        "| Type:", item.type,
        "| Shape:", item.shape
    )


# ---------------------------------------------------------
# ONNX inference
# ---------------------------------------------------------

input_name = session.get_inputs()[0].name

outputs = session.run(
    None,
    {
        input_name: features
    }
)

onnx_probabilities = outputs[0][0]

print("\nONNX probabilities:")

for class_name, probability in zip(
    classifier.classes_,
    onnx_probabilities
):
    print(
        f"  {class_name}: "
        f"{float(probability):.8f}"
    )


# ---------------------------------------------------------
# ONNX prediction
# ---------------------------------------------------------

onnx_index = np.argmax(onnx_probabilities)
onnx_prediction = classifier.classes_[onnx_index]

print("\nONNX prediction:")
print(onnx_prediction)


# ---------------------------------------------------------
# Compare
# ---------------------------------------------------------

print("\n--------------------------------")
print("MODEL COMPARISON")
print("--------------------------------")

print("Sklearn prediction:", sklearn_prediction)
print("ONNX prediction:   ", onnx_prediction)

difference = np.abs(
    sklearn_probabilities -
    onnx_probabilities
)

print("\nMaximum probability difference:")
print(float(np.max(difference)))


if sklearn_prediction == onnx_prediction:
    print("\nPrediction MATCHED! ✅")
else:
    print("\nPrediction DOES NOT MATCH! ❌")


if np.allclose(
    sklearn_probabilities,
    onnx_probabilities,
    atol=1e-5
):
    print("Probabilities MATCH! ✅")
else:
    print("Probabilities differ! ⚠️")


print("\nTest completed.")