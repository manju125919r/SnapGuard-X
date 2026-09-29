import os
import joblib
import numpy as np
import onnxruntime as ort


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

JOBLIB_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.joblib"
)

ONNX_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.onnx"
)


# --------------------------------------------------
# Test message
# --------------------------------------------------

text = "Congratulations! You won a prize. Click this link immediately to claim your reward."


# --------------------------------------------------
# Load original sklearn model
# --------------------------------------------------

print("Loading original model...")

sklearn_model = joblib.load(JOBLIB_PATH)

original_prediction = sklearn_model.predict([text])[0]

original_probability = sklearn_model.predict_proba([text])[0]

print("\nOriginal sklearn model:")
print("Prediction:", original_prediction)
print("Probabilities:", original_probability)


# --------------------------------------------------
# Load ONNX model
# --------------------------------------------------

print("\nLoading ONNX model...")

session = ort.InferenceSession(
    ONNX_PATH,
    providers=["CPUExecutionProvider"]
)

print("ONNX model loaded successfully.")


# --------------------------------------------------
# Show ONNX inputs and outputs
# --------------------------------------------------

print("\nONNX Inputs:")

for inp in session.get_inputs():
    print(
        "Name:",
        inp.name,
        "| Type:",
        inp.type,
        "| Shape:",
        inp.shape
    )


print("\nONNX Outputs:")

for output in session.get_outputs():
    print(
        "Name:",
        output.name,
        "| Type:",
        output.type,
        "| Shape:",
        output.shape
    )


# --------------------------------------------------
# Run ONNX
# --------------------------------------------------

input_name = session.get_inputs()[0].name

onnx_result = session.run(
    None,
    {
        input_name: np.array([[text]], dtype=object)
    }
)


print("\nONNX raw output:")

for i, output in enumerate(onnx_result):
    print(f"Output {i}:")
    print(output)


print("\n--------------------------------")
print("MODEL COMPARISON")
print("--------------------------------")

print("Original prediction:", original_prediction)

print("ONNX outputs received successfully.")

print("\nONNX Runtime provider:")
print(session.get_providers())