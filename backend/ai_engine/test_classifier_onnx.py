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
    "snapguard_classifier.onnx"
)


# ---------------------------------------------------------
# Test message
# ---------------------------------------------------------

text = "Congratulations! You won a prize. Click this link immediately to claim your reward."


# ---------------------------------------------------------
# Original sklearn pipeline
# ---------------------------------------------------------

print("Loading original sklearn model...")
model = joblib.load(MODEL_PATH)

tfidf = model.named_steps["tfidf"]
classifier = model.named_steps["classifier"]

features = tfidf.transform([text]).toarray().astype(np.float32)

sklearn_prediction = classifier.predict(features)[0]
sklearn_probabilities = classifier.predict_proba(features)[0]


print("\nOriginal sklearn classifier:")
print("Prediction:", sklearn_prediction)
print("Probabilities:", sklearn_probabilities)


# ---------------------------------------------------------
# ONNX model
# ---------------------------------------------------------

print("\nLoading Snapdragon-compatible ONNX classifier...")

session = ort.InferenceSession(
    ONNX_PATH,
    providers=["CPUExecutionProvider"]
)

print("ONNX model loaded.")

print("\nONNX inputs:")

for input_info in session.get_inputs():
    print(
        "Name:",
        input_info.name,
        "| Type:",
        input_info.type,
        "| Shape:",
        input_info.shape
    )


print("\nONNX outputs:")

for output_info in session.get_outputs():
    print(
        "Name:",
        output_info.name,
        "| Type:",
        output_info.type,
        "| Shape:",
        output_info.shape
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


print("\nONNX raw output:")

for i, output in enumerate(outputs):
    print(f"Output {i}:")
    print(output)


# ---------------------------------------------------------
# Compare prediction
# ---------------------------------------------------------

onnx_prediction = str(outputs[0][0])

print("\n--------------------------------")
print("MODEL COMPARISON")
print("--------------------------------")

print("Sklearn prediction:", sklearn_prediction)
print("ONNX prediction:   ", onnx_prediction)

if sklearn_prediction == onnx_prediction:
    print("\nPrediction MATCHED!")
else:
    print("\nWARNING: Prediction does NOT match.")


print("\nTest completed.")