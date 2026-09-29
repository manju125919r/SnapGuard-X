import os
import joblib
import numpy as np

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import StringTensorType


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.joblib"
)

OUTPUT_PATH = os.path.join(
    BASE_DIR,
    "model",
    "snapguard_text_model.onnx"
)


print("Loading SnapGuard X model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully.")
print(model)


# The input is raw text.
initial_type = [
    ("text", StringTensorType([None, 1]))
]


print("\nConverting model to ONNX...")

onnx_model = convert_sklearn(
    model,
    initial_types=initial_type,
    target_opset=17,
)

with open(OUTPUT_PATH, "wb") as f:
    f.write(onnx_model.SerializeToString())


print("\nONNX conversion completed.")
print(f"ONNX model saved to:")
print(OUTPUT_PATH)